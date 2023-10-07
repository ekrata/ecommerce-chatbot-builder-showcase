import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function operatorsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/operators':
      'packages/functions/app/api/src/operators/list.handler',
    'GET /orgs/{orgId}/operators/{operatorId}':
      'packages/functions/app/api/src/operators/get.handler',
    'GET /orgs/{orgId}/operators/{operatorId}/getPresignedProfileUrl':
      'packages/functions/app/api/src/operators/getPresignedProfileUrl.handler',
    'DELETE /orgs/{orgId}/operators/{operatorId}':
      'packages/functions/app/api/src/operators/delete.handler',
    'POST /orgs/{orgId}/operators/{operatorId}':
      'packages/functions/app/api/src/operators/create.handler',
    'PATCH /orgs/{orgId}/operators/{operatorId}':
      'packages/functions/app/api/src/operators/update.handler',
  });
}
