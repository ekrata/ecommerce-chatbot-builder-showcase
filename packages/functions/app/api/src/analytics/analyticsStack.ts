import { Cron, StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';

export function analyticsStack({ app, stack }: StackContext) {
  const { api } = use(baseStack);

  api.addRoutes(stack, {
    'GET /orgs/{orgId}/analytics/monthly/{analyticId}':
      'packages/functions/app/api/src/analytics/monthly/get.handler',
    'GET /orgs/{orgId}/analytics/daily/{analyticId}':
      'packages/functions/app/api/src/analytics/daily/get.handler',
    'GET /orgs/{orgId}/analytics/monthly':
      'packages/functions/app/api/src/analytics/monthly/list.handler',
    'GET /orgs/{orgId}/analytics/daily':
      'packages/functions/app/api/src/analytics/daily/list.handler',
    'POST /analytics/create-hourly-analytic':
      'packages/functions/app/api/src/analytics/createHourlyAnalytic.handler',
  });

  const createHourlyAnalyticChron = new Cron(stack, 'createHourlyAnalytic', {
    schedule: 'rate(1 hour)',
    job: 'packages/functions/app/api/src/analytics/createHourlyAnalytic.handler',
    enabled: !app.local,
  });
}
