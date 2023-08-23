import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function operatorsStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

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
