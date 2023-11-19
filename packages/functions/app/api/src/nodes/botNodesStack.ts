import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function botNodesStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    // 'GET /orgs/{orgId}/bots':
    //   'packages/functions/app/api/src/bots/list.handler',
    // 'GET /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/bots/get.handler',
    'POST /orgs/{orgId}/nodes/actions/ask-a-question':
      'packages/functions/app/api/src/nodes/actions/askAQuestion.handler',
    'POST /orgs/{orgId}/nodes/process-interaction':
      'packages/functions/app/api/src/nodes/processInteraction.handler',
    // 'DELETE /orgs/{orgId}/nodes/{botId}':
    //   'packages/functions/app/api/src/nodes/delete.handler',
    // 'POST /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/nodes/create.handler',
    // 'GET /orgs/{orgId}/nodes/chatbots/sales': {
    //   function: {
    //     handler: 'packages/functions/app/api/src/nodes/chatbots/sales.handler',
    //     timeout: 10,
    //     permissions: ['bedrock:InvokeModel'],
    //   },
    // },
  });
}
