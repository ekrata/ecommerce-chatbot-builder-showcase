import { ApiHandler, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, operatorId } = usePathParams();
    if (!operatorId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const res = await appDb.entities.operators
        .get({ orgId, operatorId })
        .go();
      if (res.data) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      return {
        statusCode: 404,
        body: `No operator with operatorId: ${operatorId} and orgId: ${orgId} exists. `,
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
