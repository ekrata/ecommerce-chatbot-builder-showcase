import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function orgsStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs': 'packages/functions/app/api/src/orgs/list.handler',
    'GET /orgs/{orgId}': 'packages/functions/app/api/src/orgs/get.handler',
    'DELETE /orgs/{orgId}':
      'packages/functions/app/api/src/orgs/delete.handler',
    'POST /orgs/{orgId}': 'packages/functions/app/api/src/orgs/create.handler',
    'PATCH /orgs/{orgId}': 'packages/functions/app/api/src/orgs/update.handler',
  });
}
