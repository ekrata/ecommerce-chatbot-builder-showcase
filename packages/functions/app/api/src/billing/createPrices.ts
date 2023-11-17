import { writeFile } from 'fs/promises';
import { delay } from 'lodash';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import Stripe from 'stripe';
import { setTimeout } from 'timers/promises';

import * as Sentry from '@sentry/serverless';

const stripe = new Stripe(Config.STRIPE_KEY_SECRET, { maxNetworkRetries: 3 });

export const starterSeatPriceMap = {
  1: 0,
  2: 1400,
  3: 2800,
  4: 4200,
  5: 5600,
};

export const starterChatbotTriggersPriceMap = {
  1000: 0,
  2000: 1000,
  3000: 2000,
  5000: 3000,
  10000: 5000,
  20000: 7500,
  50000: 10900,
};

export const plusSeatsPriceMap = {
  1: 0,
  2: 2200,
  3: 4400,
  4: 6600,
  5: 8800,
};
export const plusChatbotTriggersPriceMap = {
  1000: 0,
  2000: 1000,
  3000: 2000,
  5000: 3500,
  10000: 6000,
  20000: 10500,
  50000: 14500,
};

// 20% off
export const yearlyDiscount = 0.8;

export const timeout = 150000;

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      // base product + $0 seats + $0 chatbot triggers
      const starterProduct = await stripe.products.create({
        name: 'eChat Starter',
        tax_code: 'txcd_10103001',
        description:
          'Increase website engagement and boost customer satisfaction with website live chat, chatbot, and custom bot creation.',
      });

      // plus product + $0 seats + $0 chatbot triggers
      const plusProduct = await stripe.products.create({
        name: 'eChat Plus',
        tax_code: 'txcd_10103001',
        description:
          'Everything in starter, plus the Help Center & Articles, Whatsapp, Facebook and Instagram messaging.',
      });

      const monthlyPrices = await createPricesForInterval(
        starterProduct,
        plusProduct,
        'month',
      );

      const yearlyPrices = await createPricesForInterval(
        starterProduct,
        plusProduct,
        'year',
      );

      const body = JSON.stringify({
        monthlyPrices,
        yearlyPrices,
      } as CreatePricesResponse);

      await writeFile(`data/billing/${Config.STAGE}-prices.json`, body);

      console.log('prices saved');

      return {
        statusCode: 200,
        body,
      };
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);

export type CreatePrices = Awaited<ReturnType<typeof createPricesForInterval>>;

export type CreatePricesResponse = {
  monthlyPrices: CreatePrices;
  yearlyPrices: CreatePrices;
};

const createPricesForInterval = async (
  starterProduct: Stripe.Product,
  plusProduct: Stripe.Product,
  interval: 'month' | 'year',
) => {
  const starterPrice = await stripe.prices.create({
    unit_amount: interval === 'year' ? 1600 * 12 * yearlyDiscount : 1600,
    currency: 'usd',
    recurring: {
      interval,
    },
    product: starterProduct.id,
  });

  const plusPrice = await stripe.prices.create({
    unit_amount: interval === 'year' ? 39000 * 12 * yearlyDiscount : 3900,
    currency: 'usd',
    recurring: {
      interval,
    },

    product: plusProduct.id,
  });

  const starterSeatPrices = await Promise.all(
    Object.entries(starterSeatPriceMap).map(async ([seatCount, price]) => {
      const product = await stripe.products.create({
        name: `${starterProduct.name}: Seats - ${seatCount}`,
        tax_code: 'txcd_10103001',
      });
      return await stripe.prices.create({
        unit_amount: interval === 'year' ? price * 12 * yearlyDiscount : price,
        currency: 'usd',
        recurring: {
          interval,
        },
        metadata: {
          type: 'starter',
          seatCount,
        },
        nickname: `${starterProduct.name} price: Seats - ${seatCount}`,
        product: product.id,
      });
    }),
  );

  // triggers always per month
  const starterChatbotTriggerPrices = await Promise.all(
    Object.entries(starterChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) => {
        const product = await stripe.products.create({
          name: `${starterProduct.name}: Bot Triggers - ${triggerCount} per month`,
          tax_code: 'txcd_10103001',
        });
        return await stripe.prices.create({
          unit_amount:
            interval === 'year' ? price * 12 * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          metadata: {
            type: 'starter',
            triggerCount,
          },
          nickname: `${starterProduct.name}: Bot Triggers - ${triggerCount} per month`,
          product: product.id,
        });
      },
    ),
  );

  console.log('starter prices done');

  const plusSeatPrices = await Promise.all(
    Object.entries(plusSeatsPriceMap).map(async ([seatCount, price]) => {
      const product = await stripe.products.create({
        name: `${plusProduct.name}: Seats - ${seatCount}`,
        tax_code: 'txcd_10103001',
      });
      return await stripe.prices.create({
        unit_amount: interval === 'year' ? price * 12 * yearlyDiscount : price,
        currency: 'usd',
        recurring: {
          interval,
        },
        metadata: {
          type: 'plus',
          seatCount,
        },
        nickname: `${plusProduct.name}: Seats - ${seatCount}`,
        product: product.id,
      });
    }),
  );

  const plusChatbotTriggerPrices = await Promise.all(
    Object.entries(plusChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) => {
        const product = await stripe.products.create({
          name: `${plusProduct.name}: Bot Triggers - ${triggerCount} per month`,
          tax_code: 'txcd_10103001',
        });
        return await stripe.prices.create({
          unit_amount:
            interval === 'year' ? price * 12 * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          metadata: {
            type: 'plus',
            triggerCount,
          },
          nickname: `${plusProduct.name}: Bot Triggers - ${triggerCount} per month`,
          product: product.id,
        });
      },
    ),
  );

  console.log('plus prices done');
  return {
    starterProduct,
    plusProduct,
    starterPrice,
    plusPrice,
    starterSeatPrices,
    starterChatbotTriggerPrices,
    plusSeatPrices,
    plusChatbotTriggerPrices,
  };
};
