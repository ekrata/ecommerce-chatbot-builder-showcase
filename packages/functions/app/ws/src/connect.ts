import * as Sentry from '@sentry/serverless';
import { appDb } from 'packages/functions/app/api/src/db';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = Sentry.AWSLambda.wrapHandler(
  async (event) => {
    const { orgId, customerId, operatorId } = event.queryStringParameters;
    if ((!orgId && !customerId) || (!orgId && !operatorId)) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      if (customerId) {
        console.log('hi');
        const res = await appDb(Table.app.tableName)
          .entities.customers.patch({ orgId, customerId })
          .set({ connectionId: event.requestContext?.connectionId })
          .go();

        return {
          statusCode: 200,
          body: 'Connected',
        };
      }
      if (operatorId) {
        console.log('hi');
        const res = await appDb(Table.app.tableName)
          .entities.operators.patch({ orgId, operatorId })
          .set({ connectionId: event.requestContext?.connectionId })
          .go();
        return {
          statusCode: 200,
          body: 'Connected',
        };
      }
      return {
        statusCode: 500,
        body: 'Please provide a customerId or operatorId you wish to connect with.',
      };
    } catch (err) {
      // Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }
);
