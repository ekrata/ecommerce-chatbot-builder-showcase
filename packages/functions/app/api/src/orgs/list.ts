import { ApiHandler, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { appDb } from '../../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { cursor, createdAfter } = useQueryParams();
    try {
      const data = await appDb(Table.app.tableName)
        .entities.orgs.query.all([])
        .gt({
          createdAt: createdAfter
            ? new Date(parseInt(createdAfter, 10)).getTime()
            : Date.UTC(1970, 0, 1),
        })
        .go(cursor ? { cursor, limit: 50 } : { limit: 50 });
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
