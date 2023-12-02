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
    'POST /analytics/combine-analytics':
      'packages/functions/app/api/src/analytics/combineAnalytics.handler',
    'POST /analytics/combine-into-daily-analytic':
      'packages/functions/app/api/src/analytics/combineIntoDailyAnalytic.handler',
    'POST /analytics/combine-into-weekly-analytic':
      'packages/functions/app/api/src/analytics/combineIntoWeeklyAnalytic.handler',
    'POST /analytics/combine-into-monthly-analytic':
      'packages/functions/app/api/src/analytics/combineIntoMonthlyAnalytic.handler',
  });

  const createHourlyAnalyticChron = new Cron(stack, 'createHourlyAnalytic', {
    schedule: 'rate(1 hour)',
    job: 'packages/functions/app/api/src/analytics/createHourlyAnalytic.handler',
    enabled: !app.local,
  });

  const combineIntoDailyAnalytic = new Cron(stack, 'combineIntoDailyAnalytic', {
    schedule: 'rate(1 hour)',
    job: 'packages/functions/app/api/src/analytics/combineIntoDailyAnalytic.handler',
    enabled: !app.local,
  });

  const combineIntoWeeklyAnalytic = new Cron(
    stack,
    'combineIntoWeeklyAnalytic',
    {
      schedule: 'rate(1 week)',
      job: 'packages/functions/app/api/src/analytics/combineIntoWeeklyAnalytic.handler',
      enabled: !app.local,
    },
  );

  const combineIntoMonthlyAnalytic = new Cron(
    stack,
    'combineIntoMonthlyAnalytic',
    {
      schedule: 'rate(1 month)',
      job: 'packages/functions/app/api/src/analytics/combineIntoMonthlyAnalytic.handler',
      enabled: !app.local,
    },
  );
}
