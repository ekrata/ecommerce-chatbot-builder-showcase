import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function stripeStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  // api.addRoutes(stack, {
  //   // 'POST /webhooks/meta/messaging':
  //   //   'packages/functions/app/api/src/webhooks/meta/messaging.handler',
  //   // 'GET /webhooks/meta/verify':
  //   //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging.handler',
  //   // 'POST /webhooks/meta/messaging':
  //   //   'packages/functions/app/api/src/webhooks/meta/messaging',
  //   // 'GET /webhooks/meta/messaging':
  //   //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging',
  //   // 'POST /webhooks/meta/messaging':
  //   //   'packages/functions/app/api/src/webhooks/meta/messaging',
  //   // 'GET /webhooks/meta/messaging':
  //   //   'packages/functions/app/api/src/webhooks/meta/verifyMessaging',
  //   // 'POST /stripe/email':
  //   //   'packages/functions/app/api/src/webhooks/email.handler',
  //   'POST /billing/webhook':
  //     'packages/functions/app/api/src/billing/webhook.handler',

  // });
  if (app?.stage !== 'prod') {
    api.addRoutes(stack, {
      'POST /billing/create-prices': {
        function: {
          handler:
            'packages/functions/app/api/src/billing/createPrices.handler',
          timeout: 200,
        },
      },
      'POST /billing/create-payment-links': {
        function: {
          handler:
            'packages/functions/app/api/src/billing/createPaymentLinks.handler',
          timeout: 200,
        },
      },
    });
  }
}
