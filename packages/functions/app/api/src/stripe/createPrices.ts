import { writeFile } from 'fs/promises';
import { delay } from 'lodash';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import Stripe from 'stripe';
import { setTimeout } from 'timers/promises';

import * as Sentry from '@sentry/serverless';

const stripe = new Stripe(Config.STRIPE_KEY_SECRET);

export const starterSeatPriceMap = {
  1: 0,
  2: 500,
  3: 1000,
  4: 1500,
  5: 2000,
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
  2: 1000,
  3: 2000,
  4: 3000,
  5: 4000,
};
export const plusChatbotTriggersPriceMap = {
  1000: 0,
  2000: 1500,
  3000: 2500,
  5000: 4500,
  10000: 7500,
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
          'Includes website live chat, chatbot, custom bot creation and more',
      });

      // plus product + $0 seats + $0 chatbot triggers
      const plusProduct = await stripe.products.create({
        name: 'eChat Plus',
        tax_code: 'txcd_10103001',
        description:
          'Includes Help Center, Articles, whatsapp, facebook and instagram messaging.',
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

      await writeFile(
        `packages/functions/app/api/src/stripe/${Config.STAGE}-prices.json`,
        body,
      );

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
    unit_amount: interval === 'year' ? 1600 * yearlyDiscount : 1600,
    currency: 'usd',
    recurring: {
      interval,
    },
    product: starterProduct.id,
  });

  const starterSeatPrices = await Promise.all(
    Object.entries(starterSeatPriceMap).map(async ([seatCount, price]) => {
      return await stripe.prices.create({
        unit_amount: interval === 'year' ? price * yearlyDiscount : price,
        currency: 'usd',
        recurring: {
          interval,
        },
        nickname: `${starterProduct.name}: seats - ${seatCount}`,
        product: starterProduct.id,
      });
    }),
  );

  const starterChatbotTriggerPrices = await Promise.all(
    Object.entries(starterChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) => {
        return await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${starterProduct.name}: bot triggers - ${triggerCount}`,
          product: starterProduct.id,
        });
      },
    ),
  );

  console.log('starter prices done');

  const plusPrice = await stripe.prices.create({
    unit_amount: interval === 'year' ? 39000 * yearlyDiscount : 3900,
    currency: 'usd',
    recurring: {
      interval,
    },
    product: plusProduct.id,
  });

  const plusSeatPrices = await Promise.all(
    Object.entries(plusSeatsPriceMap).map(async ([seatCount, price]) => {
      return await stripe.prices.create({
        unit_amount: interval === 'year' ? price * yearlyDiscount : price,
        currency: 'usd',
        recurring: {
          interval,
        },
        nickname: `${plusProduct.name}: seats - ${seatCount}`,
        product: plusProduct.id,
      });
    }),
  );

  const plusChatbotTriggerPrices = await Promise.all(
    Object.entries(plusChatbotTriggersPriceMap).map(
      async ([triggerCount, price]) => {
        return await stripe.prices.create({
          unit_amount: interval === 'year' ? price * yearlyDiscount : price,
          currency: 'usd',
          recurring: {
            interval,
          },
          nickname: `${plusProduct.name}: Bot Triggers - ${triggerCount}`,
          product: starterProduct.id,
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
