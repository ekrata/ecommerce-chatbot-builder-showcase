import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function interactionsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/interactions':
      'packages/functions/app/api/src/interactions/list.handler',
    'GET /orgs/{orgId}/interactions/{interactionId}':
      'packages/functions/app/api/src/interactions/get.handler',
    'DELETE /orgs/{orgId}/interactions/{interactionId}':
      'packages/functions/app/api/src/interactions/delete.handler',
    'POST /orgs/{orgId}/interactions/{interactionId}':
      'packages/functions/app/api/src/interactions/create.handler',
    'PATCH /orgs/{orgId}/interactions/{interactionId}':
      'packages/functions/app/api/src/interactions/update.handler',
  });
}
