import { ApiHandler, useHeaders, usePathParams, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const queryDomain = useQueryParam('domain')
    const headers = useHeaders()
    const domain = new URL(headers?.origin ?? '').hostname
    try {
      const appDb = getAppDb(Config?.REGION, Table?.app.tableName);
      const res = await appDb.entities.orgs.scan.where((org, {eq}) => `${eq(org?.domain, queryDomain ?? domain)}`).go();
      if (res.data?.[0]) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data?.[0]),
        };
      }
      return {
        statusCode: 404,
        body: `No conversation with domain: ${domain} exists. `,
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
