import { sub } from 'date-fns';
import { ApiHandler, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { combineAnalytics } from './combineAnalytics';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

// instead of updating the latest analytic everytime a new conversation happens, we retroactively calculate the metrics here
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const fromTimestamp = useQueryParam('fromTimestamp') ?? undefined;
      const startDate = fromTimestamp
        ? parseInt(fromTimestamp, 10)
        : sub(Date.now(), { months: 1 }).getTime();

      const analytics = combineAnalytics(startDate, Date.now(), 'month', appDb);
      return {
        statusCode: 200,
        body: JSON.stringify(analytics),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
