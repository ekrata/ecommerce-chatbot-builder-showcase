import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { cursor } = useQueryParams();
    const { orgId, lang } = usePathParams();
    if (!orgId || !lang) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const data = await appDb.entities.articleContents.query
        .byOrg({ lang, orgId })
        .go(cursor ? { cursor, limit: 5 } : { limit: 5 });
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
