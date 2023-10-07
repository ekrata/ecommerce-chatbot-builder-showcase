import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function customersStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/customers':
      'packages/functions/app/api/src/customers/list.handler',
    'GET /orgs/{orgId}/customers/{customerId}':
      'packages/functions/app/api/src/customers/get.handler',
    'DELETE /orgs/{orgId}/customers/{customerId}':
      'packages/functions/app/api/src/customers/delete.handler',
    'POST /orgs/{orgId}/customers/{customerId}':
      'packages/functions/app/api/src/customers/create.handler',
    'PATCH /orgs/{orgId}/customers/{customerId}':
      'packages/functions/app/api/src/customers/update.handler',
  });
}
