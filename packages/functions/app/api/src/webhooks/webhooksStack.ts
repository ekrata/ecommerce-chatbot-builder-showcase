import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function webhooksStack({ app, stack }: StackContext) {
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
    'POST /webhooks/email':
      'packages/functions/app/api/src/webhooks/email.handler',
    'POST /webhooks/stripe':
      'packages/functions/app/api/src/webhooks/stripe/webhook.handler',
  });
  if (app?.stage !== 'prod') {
    api.addRoutes(stack, {
      'POST /webhooks/stripe/createStripeData': {
        function: {
          handler:
            'packages/functions/app/api/src/webhooks/stripe/createStripeData.handler',
          timeout: 200,
        },
      },
    });
  }
}
