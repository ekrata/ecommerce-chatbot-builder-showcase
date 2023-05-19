import * as Sentry from '@sentry/serverless';
import { ApiHandler, useQueryParams } from 'sst/node/api';
import { appDb } from 'packages/functions/app/api/src/db';
import { Table } from 'sst/node/table';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, customerId } = useQueryParams();
    if (!orgId || !customerId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb(Table.app.tableName)
        .entities.customers.patch({ orgId, customerId })
        .set({ currentConnectionId: '' })
        .go();
      return {
        statusCode: 500,
        body: JSON.stringify(res?.data),
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
