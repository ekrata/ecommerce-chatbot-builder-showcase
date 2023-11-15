const stripe = require('stripe')(
  'sk_test_51MQ32QFfks7Ym3WegFoeblO6CptjGajXOieXB5WEduUm059zt5WZoH1yTaPkNPylgYh5VSo037h0dPWlxKbFq6Iv00w5kcLUJv',
);

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

const start = async () => {
  const subscription = await stripe.subscriptions.create({
    customer: '{{CUSTOMER_ID}}',
    items: [
      {
        price: 'price_CBXbz9i7AIOTzr',
      },
      {
        price: 'price_IFuCu48Snc02bc',
        quantity: 2,
      },
    ],
  });

  // base product + $0 seats + $0 chatbot triggers
  const starterProduct = await stripe.products.create({
    name: 'Starter',
    description:
      'Includes website live chat, chatbot, custom bot creation and more',
  });
  const starterPrice = await stripe.prices.create({
    unit_amount: 16000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: starterProduct.id,
  });

  const starterSeatPrices = Promise.all(
    Object.entries(starterSeatPriceMap).map(
      async ([seatCount, price]) =>
        await stripe.prices.create({
          unit_amount: price,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          nickname: `echat-starter-${seatCount}`,
          product: starterProduct.id,
        }),
    ),
  );

  const starterChatbotTriggerPrices = Promise.all(
    Object.entries(starterChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) =>
        await stripe.prices.create({
          unit_amount: price,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          nickname: `echat-starter-${triggerCount}`,
          product: starterProduct.id,
        }),
    ),
  );

  // base product + $0 seats + $0 chatbot triggers
  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description:
      'Includes Help Center, Articles, whatsapp, facebook and instagram messaging.',
  });
  const plusPrice = await stripe.prices.create({
    unit_amount: 39000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: plusProduct.id,
  });

  const plusSeatPrices = Promise.all(
    Object.entries(plusSeatsPriceMap).map(
      async ([seatCount, price]) =>
        await stripe.prices.create({
          unit_amount: price,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          nickname: `echat-plus-${seatCount}`,
          product: plusProduct.id,
        }),
    ),
  );

  const plusChatbotTriggers = Promise.all(
    Object.entries(plusChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) =>
        await stripe.prices.create({
          unit_amount: price,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          nickname: `echat-plus-${triggerCount}`,
          product: starterProduct.id,
        }),
    ),
  );
};
