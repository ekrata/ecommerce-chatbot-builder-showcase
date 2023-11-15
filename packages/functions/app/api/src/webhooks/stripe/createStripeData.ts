import { writeFile } from 'fs/promises';
import { Config } from 'sst/node/config';
import Stripe from 'stripe';

const stripe = new Stripe(Config.STRIPE_KEY_SECRET);

export const starterSeatPriceMap = {
  1: 0,
  2: 5000,
  3: 10000,
  4: 15000,
  5: 20000,
};

export const starterChatbotTriggersPriceMap = {
  1000: 0,
  2000: 10000,
  3000: 20000,
  5000: 30000,
  10000: 50000,
  20000: 75000,
  50000: 109000,
};

export const plusSeatsPriceMap = {
  1: 0,
  2: 10000,
  3: 20000,
  4: 30000,
  5: 40000,
};
export const plusChatbotTriggersPriceMap = {
  1000: 0,
  2000: 15000,
  3000: 25000,
  5000: 45000,
  10000: 75000,
  20000: 105000,
  50000: 145000,
};

// 20% off
export const yearlyDiscount = 0.8;

const start = async () => {
  // base product + $0 seats + $0 chatbot triggers
  const starterProduct = await stripe.products.create({
    name: 'eChat Starter',
    description:
      'Includes website live chat, chatbot, custom bot creation and more',
  });

  // plus product + $0 seats + $0 chatbot triggers
  const plusProduct = await stripe.products.create({
    name: 'eChat Plus',
    description:
      'Includes Help Center, Articles, whatsapp, facebook and instagram messaging.',
  });

  const { starterLinks: monthlyStarterLinks, plusLinks: monthlyPlusLinks } =
    await createInterval(starterProduct, plusProduct, 'month');

  const { starterLinks: yearlyStarterLinks, plusLinks: yearlyPlusLinks } =
    await createInterval(starterProduct, plusProduct, 'year');

  await writeFile(
    'packages/functions/app/api/src/webhooks/stripe/paymentLinks.json',
    JSON.stringify([
      monthlyStarterLinks,
      monthlyPlusLinks,
      yearlyStarterLinks,
      yearlyPlusLinks,
    ]),
  );
};

const createInterval = async (
  starterProduct: Stripe.Product,
  plusProduct: Stripe.Product,
  interval: 'month' | 'year',
) => {
  const starterPrice = await stripe.prices.create({
    unit_amount: interval === 'year' ? 16000 * yearlyDiscount : 16000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: starterProduct.id,
  });

  const starterSeatPrices = await Promise.all(
    Object.entries(starterSeatPriceMap).map(
      async ([seatCount, price]) =>
        await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${starterProduct.name}: seats - ${seatCount}`,
          product: starterProduct.id,
        }),
    ),
  );

  const starterChatbotTriggerPrices = await Promise.all(
    Object.entries(starterChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) =>
        await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${starterProduct.name}: bot triggers - ${triggerCount}`,
          product: starterProduct.id,
        }),
    ),
  );

  const plusPrice = await stripe.prices.create({
    unit_amount: interval === 'year' ? 39000 * yearlyDiscount : 39000,
    currency: 'usd',
    recurring: {
      interval,
    },
    product: plusProduct.id,
  });

  const plusSeatPrices = await Promise.all(
    Object.entries(plusSeatsPriceMap).map(
      async ([seatCount, price]) =>
        await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${plusProduct.name}: seats - ${seatCount}`,
          product: plusProduct.id,
        }),
    ),
  );

  const plusChatbotTriggerPrices = await Promise.all(
    Object.entries(plusChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) =>
        await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${plusProduct.name}: Bot Triggers - ${triggerCount}`,
          product: starterProduct.id,
        }),
    ),
  );

  const starterLinks = await Promise.all(
    starterSeatPrices.map(
      async (seatPrice) =>
        await Promise.all(
          starterChatbotTriggerPrices.map(
            async (triggerPrice) =>
              await stripe.paymentLinks.create({
                line_items: [
                  { price: starterPrice.id, quantity: 1 },
                  {
                    price: seatPrice.id,
                    quantity: 1,
                  },
                  {
                    price: triggerPrice.id,
                    quantity: 1,
                  },
                ],
                automatic_tax: {
                  enabled: true,
                },
                allow_promotion_codes: true,
                subscription_data: {
                  trial_period_days: 7,
                },
                after_completion: {
                  type: 'redirect',
                  redirect: {
                    url: Config.FRONTEND_URL,
                  },
                },
              }),
          ),
        ),
    ),
  );
  const plusLinks = await Promise.all(
    plusSeatPrices.map(
      async (seatPrice) =>
        await Promise.all(
          plusChatbotTriggerPrices.map(
            async (triggerPrice) =>
              await stripe.paymentLinks.create({
                line_items: [
                  { price: plusPrice.id, quantity: 1 },
                  {
                    price: seatPrice.id,
                    quantity: 1,
                  },
                  {
                    price: triggerPrice.id,
                    quantity: 1,
                  },
                ],
                automatic_tax: {
                  enabled: true,
                },
                allow_promotion_codes: true,
                subscription_data: {
                  trial_period_days: 7,
                },
                after_completion: {
                  type: 'redirect',
                  redirect: {
                    url: Config.FRONTEND_URL,
                  },
                },
              }),
          ),
        ),
    ),
  );

  return {
    starterLinks,
    plusLinks,
  };
};
