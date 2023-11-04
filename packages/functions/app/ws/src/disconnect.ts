import { getAppDb } from 'packages/functions/app/api/src/db';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  async (event: any, ctx, callback) => {
    try {
      const customer = (
        await appDb.entities.customers
          .find({
            connectionId: event?.requestContext?.connectionId,
          })
          .go()
      )?.data?.[0];
      if (customer) {
        const res = await appDb.entities.customers
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
        await appDb.entities.operators
          .find({
            connectionId: event?.requestContext?.connectionId,
          })
          .go()
      )?.data?.[0];
      if (operator) {
        const res = await appDb.entities.operators
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
  },
);
