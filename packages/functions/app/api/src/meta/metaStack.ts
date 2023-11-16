import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function metaStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    // 'POST /webhooks/meta/messaging':
    //   'packages/functions/app/api/src/webhooks/meta/messaging.handler',
    // 'GET /webhooks/meta/verify':
    //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging.handler',
    // 'POST /webhooks/meta/messaging':
    //   'packages/functions/app/api/src/webhooks/meta/messaging',
    // 'GET /webhooks/meta/messaging':
    //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging',
    // 'POST /webhooks/meta/messaging':
    //   'packages/functions/app/api/src/webhooks/meta/messaging',
    // 'GET /webhooks/meta/messaging':
    //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging',
    // 'POST /stripe/email':
    //   'packages/functions/app/api/src/webhooks/email.handler',
    // 'POST /stripe/stripe':
    //   'packages/functions/app/api/src/webhooks/stripe/webhook.handler',
  });
  // if (app?.stage !== 'prod') {
  //   api.addRoutes(stack, {
  //     'POST /stripe/create-stripe-prices': {
  //       function: {
  //         handler:
  //           'packages/functions/app/api/src/stripe/createStripeprices.handler',
  //         timeout: 200,
  //       },
  //     },
  //     'POST /stripe/create-stripe-payment-links': {
  //       function: {
  //         handler:
  //           'packages/functions/app/api/src/stripe/createStripePaymentLinks.handler',
  //         timeout: 200,
  //       },
  //     },
  //   });
  // }
}
