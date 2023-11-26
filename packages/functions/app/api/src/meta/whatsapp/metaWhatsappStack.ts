import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function metaWhatsappStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /meta/whatsapp/webhook':
      'packages/functions/app/api/src/meta/whatsapp/webhook.handler',
  });
}
