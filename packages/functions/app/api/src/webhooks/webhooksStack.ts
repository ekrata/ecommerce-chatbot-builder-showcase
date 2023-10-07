import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function webhooksStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'POST /webhooks/meta/messaging':
      'packages/functions/app/api/src/webhooks/meta/messaging.handler',
    'GET /webhooks/meta/verify':
      'packages/functions/app/api/src/webhooks/meta/verifyMessaging.handler',
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
  });
}
