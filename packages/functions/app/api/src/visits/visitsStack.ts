import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function visitsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/visits':
      'packages/functions/app/api/src/visits/list.handler',
    'GET /orgs/{orgId}/visits/{visitId}':
      'packages/functions/app/api/src/visits/get.handler',
    'DELETE /orgs/{orgId}/visits/{visitId}':
      'packages/functions/app/api/src/visits/delete.handler',
    'POST /orgs/{orgId}/visits/{visitId}':
      'packages/functions/app/api/src/visits/create.handler',
    'PATCH /orgs/{orgId}/visits/{visitId}':
      'packages/functions/app/api/src/visits/update.handler',
  });
}
