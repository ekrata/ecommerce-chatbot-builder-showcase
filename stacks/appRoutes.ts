import { ApiRouteProps } from 'sst/constructs';

export const appRoutes: Record<string, ApiRouteProps<string>> = {
  'GET /orgs/{orgId}/conversations':
    'packages/functions/app/api/src/conversations/list.handler',
  'GET /orgs/{orgId}/conversations/{conversationId}':
    'packages/functions/app/api/src/conversations/get.handler',
  'DELETE /orgs/{orgId}/conversations/{conversationId}':
    'packages/functions/app/api/src/conversations/delete.handler',
  'POST /orgs/{orgId}/conversations/{conversationId}':
    'packages/functions/app/api/src/conversations/create.handler',
  'PATCH /orgs/{orgId}/conversations/{conversationId}':
    'packages/functions/app/api/src/conversations/update.handler',

  'GET /orgs/{orgId}/conversations/{conversationId}/messages':
    'packages/functions/app/api/src/conversations/messages/list.handler',
  'GET /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
    'packages/functions/app/api/src/conversations/messages/get.handler',
  'DELETE /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
    'packages/functions/app/api/src/conversations/messages/delete.handler',
  'POST /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
    'packages/functions/app/api/src/conversations/messages/create.handler',
  // 'PATCH /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
  //   'packages/functions/app/api/src/conversations/messages/update.handler',

  'GET /orgs': 'packages/functions/app/api/src/orgs/list.handler',
  'GET /orgs/{orgId}': 'packages/functions/app/api/src/orgs/get.handler',
  'DELETE /orgs/{orgId}': 'packages/functions/app/api/src/orgs/delete.handler',
  'POST /orgs/{orgId}': 'packages/functions/app/api/src/orgs/create.handler',
  'PATCH /orgs/{orgId}': 'packages/functions/app/api/src/orgs/update.handler',

  'GET /orgs/{orgId}/configuration':
    'packages/functions/app/api/src/configuration/get.handler',
  'DELETE /orgs/{orgId}/configuration':
    'packages/functions/app/api/src/configuration/delete.handler',
  'POST /orgs/{orgId}/configuration':
    'packages/functions/app/api/src/configuration/create.handler',
  'PATCH /orgs/{orgId}/configuration':
    'packages/functions/app/api/src/configuration/update.handler',

  'GET /orgs/{orgId}/translations/{lang}':
    'packages/functions/app/api/src/translations/get.handler',
  'DELETE /orgs/{orgId}/translations/{lang}':
    'packages/functions/app/api/src/translations/delete.handler',
  'POST /orgs/{orgId}/translations/{lang}':
    'packages/functions/app/api/src/translations/create.handler',
  'PATCH /orgs/{orgId}/translations/{lang}':
    'packages/functions/app/api/src/translations/update.handler',

  'GET /orgs/{orgId}/{lang}/articles/{articleId}':
    'packages/functions/app/api/src/articles/get.handler',
  'GET /orgs/{orgId}/{lang}/articles':
    'packages/functions/app/api/src/articles/list.handler',
  'DELETE /orgs/{orgId}/{lang}/articles/{articleId}':
    'packages/functions/app/api/src/articles/delete.handler',
  'POST /orgs/{orgId}/{lang}/articles/{articleId}':
    'packages/functions/app/api/src/articles/create.handler',
  'PATCH /orgs/{orgId}/{lang}/articles/{articleId}':
    'packages/functions/app/api/src/articles/update.handler',

  'GET /orgs/{orgId}/{lang}/article-contents/{articleContentId}':
    'packages/functions/app/api/src/article-contents/get.handler',
  'GET /orgs/{orgId}/{lang}/article-contents/search':
    'packages/functions/app/api/src/article-contents/search.handler',
  'GET /orgs/{orgId}/{lang}/article-contents':
    'packages/functions/app/api/src/article-contents/list.handler',
  'DELETE /orgs/{orgId}/{lang}/article-contents/{articleContentId}':
    'packages/functions/app/api/src/article-contents/delete.handler',
  'POST /orgs/{orgId}/{lang}/article-contents/{articleContentId}':
    'packages/functions/app/api/src/article-contents/create.handler',
  'PATCH /orgs/{orgId}/{lang}/article-contents/{articleContentId}':
    'packages/functions/app/api/src/article-contents/update.handler',

  'GET /orgs/{orgId}/operators':
    'packages/functions/app/api/src/operators/list.handler',
  'GET /orgs/{orgId}/operators/{operatorId}':
    'packages/functions/app/api/src/operators/get.handler',
  'DELETE /orgs/{orgId}/operators/{operatorId}':
    'packages/functions/app/api/src/operators/delete.handler',
  'POST /orgs/{orgId}/operators/{operatorId}':
    'packages/functions/app/api/src/operators/create.handler',
  'PATCH /orgs/{orgId}/operators/{operatorId}':
    'packages/functions/app/api/src/operators/update.handler',

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

  'GET /orgs/{orgId}/visitors':
    'packages/functions/app/api/src/visitors/list.handler',
  'GET /orgs/{orgId}/visitors/{visitorId}':
    'packages/functions/app/api/src/visitors/get.handler',
  'DELETE /orgs/{orgId}/visitors/{visitorId}':
    'packages/functions/app/api/src/visitors/delete.handler',
  'POST /orgs/{orgId}/visitors/{visitorId}':
    'packages/functions/app/api/src/visitors/create.handler',
  'PATCH /orgs/{orgId}/visitors/{visitorId}':
    'packages/functions/app/api/src/visitors/update.handler',

  'GET /orgs/{orgId}/settings':
    'packages/functions/app/api/src/customers/get.handler',
  'PATCH /orgs/{orgId}/settings':
    'packages/functions/app/api/src/customers/update.handler',
};
