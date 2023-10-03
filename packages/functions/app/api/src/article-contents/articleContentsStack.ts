import { StackContext, use } from 'sst/constructs';
import { BaseStack } from 'stacks/BaseStack';

export function articleContentsStack({ stack }: StackContext) {
  const { api } = use(BaseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/lang/{lang}/article-contents/{articleContentId}':
      'packages/functions/app/api/src/article-contents/get.handler',
    'GET /orgs/{orgId}/lang/{lang}/article-contents':
      'packages/functions/app/api/src/article-contents/list.handler',
    'DELETE /orgs/{orgId}/lang/{lang}/article-contents/{articleContentId}':
      'packages/functions/app/api/src/article-contents/delete.handler',
    'POST /orgs/{orgId}/lang/{lang}/article-contents/{articleContentId}':
      'packages/functions/app/api/src/article-contents/create.handler',
    'PATCH /orgs/{orgId}/lang/{lang}/article-contents/{articleContentId}':
      'packages/functions/app/api/src/article-contents/update.handler',
  });
}
