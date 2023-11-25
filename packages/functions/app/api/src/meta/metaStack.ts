import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function metaStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'POST /webhooks/meta/messaging':
      'packages/functions/app/api/src/webhooks/meta/messaging.handler',
    'GET /webhooks/meta/verify':
      'packages/functions/app/api/src/webhooks/meta/verifyMessaging.handler',
    'GET /webhooks/meta/messaging':
      'packages/functions/app/api/src/webhooks/meta/verifyMessaging',
    'POST /meta/instagram/webhook':
      'packages/functions/app/api/src/meta/instagram/webhook.handler',
    'POST /meta/messenger/webhook':
      'packages/functions/app/api/src/meta/messenger/webhook.handler',
    'POST /meta/whatsapp/webhook':
      'packages/functions/app/api/src/meta/whatsapp/webhook.handler',
    'OPTIONS /meta/whatsapp/webhook':
      'packages/functions/app/api/src/meta/whatsapp/webhookOptions.handler',
  });
}
