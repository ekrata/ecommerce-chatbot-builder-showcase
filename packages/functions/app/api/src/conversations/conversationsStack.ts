import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function conversationsStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

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
    'PATCH /orgs/{orgId}/conversations/{conversationId}':
      'packages/functions/app/api/src/conversations/update.handler',
  });
}
