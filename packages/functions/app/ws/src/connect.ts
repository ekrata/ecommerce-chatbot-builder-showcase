import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../api/src/db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

/**
 * See bottom answer https://stackoverflow.com/questions/57438756/error-unexpected-server-response-502-on-trying-to-connect-to-a-lambda-function
 * Callback instead of return on 200, as the socket needs to remain open.
 * @date 19/08/2023 - 10:30:57
 *
 * @type {*}
 */
export const handler = Sentry.AWSLambda.wrapHandler(
  async (event, ctx, callback) => {
    try {
      const { orgId, customerId, operatorId } = event?.queryStringParameters;
      if ((!orgId && !customerId) || (!orgId && !operatorId)) {
        return {
          statusCode: 422,
          body: 'Failed to parse an id from the url.',
        };
      }

      if (customerId) {
        await appDb.entities.customers
          .patch({ orgId, customerId })
          .set({ connectionId: event.requestContext?.connectionId })
          .go();

        callback(null, {
          statusCode: 200,
        });
      }
      if (operatorId) {
        const res = await appDb.entities.operators
          .patch({ orgId, operatorId })
          .set({ connectionId: event.requestContext?.connectionId })
          .go();
        callback(null, {
          statusCode: 200,
        });
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
  },
);
