import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function botsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/bots':
      'packages/functions/app/api/src/bots/list.handler',
    'GET /orgs/{orgId}/bots/{botId}':
      'packages/functions/app/api/src/bots/get.handler',
    'DELETE /orgs/{orgId}/bots/{botId}':
      'packages/functions/app/api/src/bots/delete.handler',
    'POST /orgs/{orgId}/bots/{botId}':
      'packages/functions/app/api/src/bots/create.handler',
    'PATCH /orgs/{orgId}/bots/{botId}':
      'packages/functions/app/api/src/bots/update.handler',
  });
}
