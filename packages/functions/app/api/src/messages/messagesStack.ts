import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function messagesStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/conversations/{conversationId}/messages':
      'packages/functions/app/api/src/messages/list.handler',
    'GET /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
      'packages/functions/app/api/src/messages/get.handler',
    'DELETE /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
      'packages/functions/app/api/src/messages/delete.handler',
    'POST /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
      'packages/functions/app/api/src/messages/create.handler',
  });
}
