import * as Sentry from '@sentry/serverless';
import { ApiHandler, useQueryParams } from 'sst/node/api';
import { appDb } from 'packages/functions/app/api/src/db';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, customerId, operatorId } = useQueryParams();
    if (!orgId || !customerId !== !operatorId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      if (customerId) {
        const res = await appDb(Table.app.tableName)
          .entities.customers.patch({ orgId, customerId })
          .set({ currentConnectionId: uuidv4() })
          .go();
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      if (operatorId) {
        const res = await appDb(Table.app.tableName)
          .entities.operators.patch({ orgId, operatorId })
          .set({ currentConnectionId: uuidv4() })
          .go();
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      return {
        statusCode: 500,
        body: 'Please provide a customerId or operatorId you wish to connect with.',
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
