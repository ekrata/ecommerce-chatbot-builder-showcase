import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../api/src/db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event) => {
    const { orgId, customerId, operatorId } = event.queryStringParameters;
    if ((!orgId && !customerId) || (!orgId && !operatorId)) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    console.log(event.requestContext?.connectionId);
    try {
      if (customerId) {
        appDb.entities.customers
          .patch({ orgId, customerId })
          .set({ connectionId: event.requestContext?.connectionId })
          .go();

        return {
          statusCode: 200,
          body: 'Connected',
        };
      }
      if (operatorId) {
        const res = await appDb.entities.operators
          .patch({ orgId, operatorId })
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
  }),
);
