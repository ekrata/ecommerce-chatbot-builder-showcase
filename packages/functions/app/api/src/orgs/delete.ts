import { ApiHandler, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const data = await appDb.entities.orgs.remove({ orgId }).go();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
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
