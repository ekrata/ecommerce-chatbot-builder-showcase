import { sub } from 'date-fns';
import { ApiHandler, usePathParams, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { RelativeDateKey } from '@/src/app/[locale]/dash/(root)/analytics/AnalyticsView';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const { orgId } = usePathParams();
      const fromTimestamp = useQueryParam('fromTimestamp') ?? undefined;
      const endTimestamp = useQueryParam('endTimestamp') ?? undefined;
      const duration: RelativeDateKey | undefined =
        useQueryParam('duration') ?? undefined;
      const endDate = endTimestamp ? parseInt(endTimestamp, 10) : Date.now();
      const startDate = fromTimestamp
        ? parseInt(fromTimestamp, 10)
        : sub(Date.now(), { months: 1 }).getTime();

      if (!orgId || !fromTimestamp || !endTimestamp || !duration) {
        return {
          statusCode: 422,
          body: 'Failed to parse an id from the url.',
        };
      }
      // get analytics in duration
      const res = await appDb.entities.analytics.query
        .byOrg({ orgId, duration })
        .where(
          ({ startAt, endAt }, { between }) =>
            `${between(startAt, startDate, endDate)} AND ${between(
              endAt,
              startDate,
              endDate,
            )}`,
        )
        .go();

      const relativeDateMap: Record<RelativeDateKey, Date> = {
        Today: sub(startDate, { days: 1 }),
        Yesterday: sub(startDate, { days: 2 }),
        'Last 7 days': sub(startDate, { days: 7 }),
        'Last 30 days': sub(startDate, { days: 30 }),
        'Last 90 days': sub(startDate, { days: 90 }),
        'Last year': sub(startDate, { years: 1 }),
        'All time': sub(startDate, { days: 90 }),
      };

      // get analytics in duration
      const resDifference = await appDb.entities.analytics.query
        .byOrg({ orgId, duration })
        .where(
          ({ startAt, endAt }, { between }) =>
            `${between(
              startAt,
              relativeDateMap[duration].getTime(),
              startDate,
            )} AND ${between(
              endAt,
              relativeDateMap[duration].getTime(),
              endDate,
            )}`,
        )
        .go();

      // get analytics for same duration immediately after, so we can calculate relative increase/decrease

      if (res.data) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            current: res?.data,
            previous: resDifference.data,
          }),
        };
      }
      return {
        statusCode: 404,
        body: `No article with orgId: ${orgId}, or articleId: ${analyticId} exists. `,
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
