import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { appDb } from '../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { cursor } = useQueryParams();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const data = await appDb(Table.app.tableName)
        .entities.customers.query.byOrg({ orgId })
        .go(cursor ? { cursor, limit: 25 } : { limit: 25 });
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
  })
);
