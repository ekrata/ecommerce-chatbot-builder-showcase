import { writeFile } from 'fs/promises';
import pLimit from 'p-limit';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import Stripe from 'stripe';
import { setTimeout } from 'timers/promises';

import * as Sentry from '@sentry/serverless';

import { CreatePrices, CreatePricesResponse } from './createPrices';

const stripe = new Stripe(Config.STRIPE_KEY_SECRET);
const limit = pLimit(2);
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const body = useJsonBody() as CreatePricesResponse;
      const monthlyPaymentLinks = await createPaymentLinks(body.monthlyPrices);
      const yearlyPaymentLinks = await createPaymentLinks(body.yearlyPrices);

      await writeFile(
        `data/billing/${Config.STAGE}-monthly-paymentLinks.json`,
        JSON.stringify(monthlyPaymentLinks),
      );

      await writeFile(
        `data/billing/${Config.STAGE}-yearly-paymentLinks.json`,
        JSON.stringify(yearlyPaymentLinks),
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ monthlyPaymentLinks, yearlyPaymentLinks }),
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

const createPaymentLinks = async (prices: CreatePrices) => {
  const {
    starterSeatPrices,
    starterChatbotTriggerPrices,
    plusChatbotTriggerPrices,
    plusProduct,
    plusPrice,
    starterPrice,
    plusSeatPrices,
    starterProduct,
  } = prices;

  console.log('payment links started');
  const starterLinks = await Promise.all(
    starterSeatPrices.map(async (seatPrice, i) => {
      return await Promise.all(
        starterChatbotTriggerPrices.map(async (triggerPrice, j) => {
          // console.log(seatPrice, triggerPrice);
          console.log(seatPrice.unit_amount, triggerPrice.unit_amount);
          const res = await limit(() =>
            stripe.paymentLinks.create({
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
              metadata: {
                ...seatPrice.metadata,
                ...triggerPrice.metadata,
              },
              allow_promotion_codes: true,
              subscription_data: {
                trial_period_days: 7,
              },
              tax_id_collection: {
                enabled: true,
              },
              after_completion: {
                type: 'redirect',
                redirect: {
                  url: Config?.FRONTEND_URL ?? '',
                },
              },
            }),
          );
          return {
            items: [starterPrice, seatPrice, triggerPrice],
            ...res,
          };
        }),
      );
    }),
  );

  console.log('starterPaymentLinks done');
  await setTimeout(10000);

  const plusLinks = await Promise.all(
    plusSeatPrices.map(async (seatPrice, i) => {
      // console.log(i, seatPrice.unit_amount);
      return await Promise.all(
        plusChatbotTriggerPrices.map(async (triggerPrice, j) => {
          console.log(seatPrice.unit_amount, triggerPrice.unit_amount);
          const res = await limit(() =>
            stripe.paymentLinks.create({
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
              metadata: {
                ...seatPrice.metadata,
                ...triggerPrice.metadata,
              },
              automatic_tax: {
                enabled: true,
              },
              tax_id_collection: {
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
          );
          return {
            items: [plusPrice, seatPrice, triggerPrice],
            ...res,
          };
        }),
      );
    }),
  );

  console.log('plus links done');
  await setTimeout(10000);

  return {
    starterLinks,
    plusLinks,
  };
};
