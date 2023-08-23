import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function articlesStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/{lang}/articles/{articleId}':
      'packages/functions/app/api/src/articles/get.handler',
    'GET /orgs/{orgId}/{lang}/articles/{articleId}/with-content':
      'packages/functions/app/api/src/articles/getWithContent.handler',
    'GET /orgs/{orgId}/{lang}/articles':
      'packages/functions/app/api/src/articles/list.handler',
    'GET /orgs/{orgId}/{lang}/articles/search':
      'packages/functions/app/api/src/articles/search.handler',
    'DELETE /orgs/{orgId}/{lang}/articles/{articleId}':
      'packages/functions/app/api/src/articles/delete.handler',
    'POST /orgs/{orgId}/{lang}/articles/{articleId}':
      'packages/functions/app/api/src/articles/create.handler',
    'PATCH /orgs/{orgId}/{lang}/articles/{articleId}':
      'packages/functions/app/api/src/articles/update.handler',
  });
}
