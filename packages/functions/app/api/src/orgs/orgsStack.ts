import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function orgsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs': 'packages/functions/app/api/src/orgs/list.handler',
    'GET /orgs/{orgId}': 'packages/functions/app/api/src/orgs/get.handler',
    'GET /orgs/by-domain':
      'packages/functions/app/api/src/orgs/getByDomain.handler',
    'DELETE /orgs/{orgId}':
      'packages/functions/app/api/src/orgs/delete.handler',
    'POST /orgs/{orgId}': 'packages/functions/app/api/src/orgs/create.handler',
    'PATCH /orgs/{orgId}': 'packages/functions/app/api/src/orgs/update.handler',
  });
}
