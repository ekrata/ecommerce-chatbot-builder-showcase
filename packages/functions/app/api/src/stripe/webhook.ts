// This is your test secret API key.
const stripe = require('stripe')();
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = 'whsec_...';
const express = require('express');
const app = express();

import {
  ApiHandler,
  useHeaders,
  useJsonBody,
  usePathParams,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const request = useJsonBody();
      const sig = useHeaders()?.['stripe-signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          request?.body,
          sig,
          endpointSecret,
        );
      } catch (err) {
        return {
          statusCode: 400,
          body: `Webhook Error: ${JSON.stringify(err)}`,
        };
      }

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.trial_will_end':
          const customerSubscriptionTrialWillEnd = event.data.object;
          // Then define and call a function to handle the event customer.subscription.trial_will_end
          break;
        case 'customer.subscription.updated':
          const customerSubscriptionUpdated = event.data.object;
          // Then define and call a function to handle the event customer.subscription.updated
          break;
        case 'invoice.paid':
          const invoicePaid = event.data.object;
          // Then define and call a function to handle the event invoice.paid
          break;
        case 'subscription_schedule.canceled':
          const subscriptionScheduleCanceled = event.data.object;
          // Then define and call a function to handle the event subscription_schedule.canceled
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {}
  }),
);
