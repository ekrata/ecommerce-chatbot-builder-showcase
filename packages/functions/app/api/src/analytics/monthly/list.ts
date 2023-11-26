import { endOfMonth, getDaysInMonth, startOfMonth } from 'date-fns';
import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    // provide any datetime in a month to get the whole month
    const monthTimestamp = parseInt(useQueryParam('monthTimestamp') ?? '', 10);
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
        .where(
          (analytics, { between }) =>
            `${between(
              new Date(analytics.createdAt),
              startOfMonth(monthTimestamp),
              endOfMonth(monthTimestamp),
            )}`,
        )
        .go({ limit: getDaysInMonth(monthTimestamp) });
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
