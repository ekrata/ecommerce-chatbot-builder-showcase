import { endOfMonth, getDaysInMonth, startOfMonth, sub } from 'date-fns';
import { relativeDiff } from 'src/helpers';
import { ApiHandler, usePathParams, useQueryParam, useQueryParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';

console.log(Config.tableName);
const appDb = getAppDb(Config?.REGION, Config?.tableName);

export type AnalyticRangeType = 'fromMonthTimestamp' | 'period' | undefined;

// comparison values are versus yesterday
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    // provide any datetime in a month to get the whole month
    const monthTimestamp = parseInt(useQueryParam('monthTimestamp') ?? '', 10);
    const rangeType: AnalyticRangeType = useQueryParam('rangeType');
    const { orgId } = usePathParams();
    if (!orgId || !monthTimestamp) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const data = await appDb.entities.analytics.query
        .byOrg({ orgId })
        .where((analytics, { between }) => {
          const createdAt = new Date(analytics.createdAt);
          if (rangeType && rangeType === 'period') {
            return `${between(
              createdAt,
              startOfMonth(monthTimestamp),
              endOfMonth(monthTimestamp),
            )}`;
          } else if (rangeType && rangeType === 'fromMonthTimestamp') {
            return `${between(
              createdAt,
              sub(createdAt, { months: 1 }),
              createdAt,
            )}`;
          }
          return ``;
        })
        .go({ limit: getDaysInMonth(monthTimestamp) });

      // get yesterday - 1 day/ yesterday change
      // today
      const dateNow = Date.now();

      const now = data?.data[-1];
      const yesterday = data?.data[-2];
      const twoDaysAgo = data?.data[-3];
      const feedbackDiff = relativeDiff(yesterday., twoDaysAgo);

      // get change

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
