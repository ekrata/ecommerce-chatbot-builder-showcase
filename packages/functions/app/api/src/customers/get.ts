import { ApiHandler, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, customerId } = usePathParams();
    if (!customerId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.customers
        .get({ orgId, customerId })
        .go();
      if (res.data) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      return {
        statusCode: 404,
        body: `No customer with customerId: ${customerId} and orgId: ${orgId} exists. `,
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
