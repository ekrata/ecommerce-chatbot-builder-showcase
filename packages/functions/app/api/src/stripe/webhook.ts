// This is your test secret API key.
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = 'whsec_...';
import {
  ApiHandler,
  useHeaders,
  useJsonBody,
  usePathParams,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import Stripe from 'stripe';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const stripe = new Stripe(Config.STRIPE_KEY_SECRET, { maxNetworkRetries: 3 });

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
          sig ?? '',
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
        case 'checkout.session.completed':
          // associate billing customerId and billingSubscriptionId by using the client_reference_id(should match orgId) from this response
          const checkoutSessionCompleted = event.data.object;
          console.log(checkoutSessionCompleted);

        case 'customer.subscription.trial_will_end':
          const customerSubscriptionTrialWillEnd = event.data.object;
          // Then define and call a function to handle the event customer.subscription.trial_will_end
          break;
        // plan change
        case 'customer.subscription.created':
          const customerSubscriptionCreated = event.data.object;
        case 'customer.subscription.updated':
          const customerSubscriptionUpdated = event.data.object;
        // unsubscribe
        case 'customer.subscription.deleted':
          const customerSubscriptionDeleted = event.data.object;
          // Then define and call a function to handle the event customer.subscription.trial_will_end
          break;
        // reset monthly quota or
        case 'invoice.paid':
          const invoicePaid = event.data.object;
          console.log(invoicePaid);
          //
          // Then define and call a function to handle the event invoice.paid
          break;
        // payment failed
        case 'invoice.payment_failed':
          // remove quota
          const invoicePaymentFailed = event.data.object;
          appDb.entities.orgs.find({});

          //
          // Then define and call a function to handle the event invoice.paid
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {}
  }),
);

// export const invoicePaid = () => {};
