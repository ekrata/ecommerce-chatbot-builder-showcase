import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function analyticsStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /analytics/monthly':
      'packages/functions/app/api/src/analytics/monthly/monthly.handler',
    'GET /analytics/daily':
      'packages/functions/app/api/src/analytics/daily/daily.handler',
  });
}
