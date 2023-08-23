import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function translationsStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/translations/{lang}':
      'packages/functions/app/api/src/translations/get.handler',
    'DELETE /orgs/{orgId}/translations/{lang}':
      'packages/functions/app/api/src/translations/delete.handler',
    'POST /orgs/{orgId}/translations/{lang}':
      'packages/functions/app/api/src/translations/create.handler',
    'PATCH /orgs/{orgId}/translations/{lang}':
      'packages/functions/app/api/src/translations/update.handler',
  });
}
