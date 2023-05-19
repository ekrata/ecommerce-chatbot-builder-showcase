import * as Sentry from '@sentry/serverless';
import { ApiHandler, useQueryParams } from 'sst/node/api';
import { appDb } from 'packages/functions/app/api/src/db';
import { Table } from 'sst/node/table';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event) => {
    console.log(event.requestContext?.connectionId);
    try {
      const customer = (
        await appDb(Table.app.tableName)
          .entities.customers.query.byConnectionId({
            connectionId: event.requestContext?.connectionId,
          })
          .go()
      ).data[0];
      if (customer) {
        const res = await appDb(Table.app.tableName)
          .entities.customers.patch({
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
        await appDb(Table.app.tableName)
          .entities.operators.query.byConnectionId({
            connectionId: event.requestContext?.connectionId,
          })
          .go()
      ).data[0];
      if (operator) {
        const res = await appDb(Table.app.tableName)
          .entities.operators.patch({
            orgId: customer.orgId,
            operatorId: operator.operatorId,
          })
          .set({ connectionId: '' })
          .go();
        return {
          statusCode: 200,
          body: 'Disconnected',
        };
      }
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  })
);
