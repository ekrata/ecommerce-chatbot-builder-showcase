import { Cron, StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function conversationsStack({ stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/conversations':
      'packages/functions/app/api/src/conversations/listByLastMessageSentAt.handler',
    'GET /orgs/{orgId}/conversations-by-createdAt':
      'packages/functions/app/api/src/conversations/listByCreatedAt.handler',
    'GET /orgs/{orgId}/conversations/search':
      'packages/functions/app/api/src/conversations/search.handler',
    'GET /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/get.handler',
    'DELETE /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/delete.handler',
    'POST /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/create.handler',
    'PUT /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/put.handler',
    'PUT /orgs/conversations/updateAverageWaitTime':
      'packages/functions/app/api/src/conversations/updateAverageWaitTime.handler',
    'PATCH /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/update.handler',
  });

  new Cron(stack, 'orgs-conversations-updaateAverageWaitTimeChron', {
    schedule: 'rate(1 day)',
    job: 'packages/functions/app/api/src/conversations/updateAverageWaitTime.handler',
  });
}
