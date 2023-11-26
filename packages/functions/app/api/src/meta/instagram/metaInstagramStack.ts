import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function metaInstagramStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /meta/instagram/webhook':
      'packages/functions/app/api/src/meta/instagram/webhook.handler',
  });
}
