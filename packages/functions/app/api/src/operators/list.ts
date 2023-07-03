import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { cursor, online } = useQueryParams();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const sortKeys: Record<string, any> = {};
      if (online) {
        sortKeys['online'] = online;
      }
      const data = await appDb.entities.operators.query
        .byOrg({ orgId, ...sortKeys })
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
