import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Config } from 'sst/node/config';
import { getAppDb } from '../db';
import { Table } from 'sst/node/table';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { operatorId, cursor } = useQueryParams();
    if (!orgId || !operatorId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const data = await appDb.entities.conversations.query
        .assigned({ orgId, operatorId })
        .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
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
