import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function botTemplatesStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /bot-templates':
      'packages/functions/app/api/src/botTemplates/list.handler',
    // 'GET /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/bots/get.handler',
    // 'GET /bots/templates':
    //   'packages/functions/app/api/src/bots/listTemplates.handler',
    // 'DELETE /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/bots/delete.handler',
    'POST /orgs/{orgId}/bot-templates/{botId}':
      'packages/functions/app/api/src/botTemplates/create.handler',
    // 'PATCH /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/bots/update.handler',
  });
}
