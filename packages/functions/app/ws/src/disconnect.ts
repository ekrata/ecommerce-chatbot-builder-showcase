import * as Sentry from '@sentry/serverless';
import { appDb } from 'packages/functions/app/api/src/db';
import { Table } from 'sst/node/table';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const db = appDb(Table.app.tableName);
    const customer = (
      await db.entities.customers.query
        .byConnectionId({
          connectionId: event.requestContext?.connectionId,
        })
        .go()
    )?.data?.[0];
    if (customer) {
      const res = await db.entities.customers
        .patch({
          orgId: customer.orgId,
          customerId: customer.customerId,
        })
        .set({ connectionId: '' })
        .go();
      return {
        statusCode: 200,
        body: 'Disconnected',
      };
    }
    const operator = (
      await db.entities.operators.query
        .byConnectionId({
          connectionId: event.requestContext?.connectionId,
        })
        .go()
    )?.data?.[0];
    if (operator) {
      const res = await db.entities.operators
        .patch({
          orgId: operator.orgId,
          operatorId: operator.operatorId,
        })
        .set({ connectionId: '' })
        .go();

      return {
        statusCode: 200,
        body: 'Disconnected',
      };
    }
    return {
      statusCode: 500,
      body: 'Failed to find a connectionId to clear',
    };
  } catch (err) {
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
