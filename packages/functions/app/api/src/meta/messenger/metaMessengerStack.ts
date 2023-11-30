import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function metaMessengerStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    // 'GET /meta/messenger/webhook':
    //   'packages/functions/app/api/src/meta/messenger/webhook.handler',
  });
}
