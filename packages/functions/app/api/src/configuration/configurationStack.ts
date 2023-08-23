import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function configurationStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/configuration':
      'packages/functions/app/api/src/configuration/get.handler',
    'DELETE /orgs/{orgId}/configuration':
      'packages/functions/app/api/src/configuration/delete.handler',
    'POST /orgs/{orgId}/configuration':
      'packages/functions/app/api/src/configuration/create.handler',
    'PATCH /orgs/{orgId}/configuration':
      'packages/functions/app/api/src/configuration/update.handler',

    'GET /orgs/{orgId}/configuration/getPresignedLogoUrl':
      'packages/functions/app/api/src/configuration/getPresignedLogoUrl.handler',
    'GET /orgs/{orgId}/configuration/getPresignedBotLogoUrl':
      'packages/functions/app/api/src/configuration/getPresignedBotLogoUrl.handler',
  });
}
