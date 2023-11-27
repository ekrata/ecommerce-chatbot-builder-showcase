import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';
import { paramStack } from 'stacks/paramStack';

export function metaWhatsappStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);
  const { metaWhatsappTopic } = use(paramStack);

  api.addRoutes(stack, {
    'GET /meta/whatsapp/webhook': {
      function: {
        handler: 'packages/functions/app/api/src/meta/whatsapp/webhook.handler',
        bind: [metaWhatsappTopic],
      },
    },
    'POST /meta/whatsapp/webhook': {
      function: {
        handler: 'packages/functions/app/api/src/meta/whatsapp/webhook.handler',
        bind: [metaWhatsappTopic],
      },
    },
  });
}
