import {
  ApiHandler,
  useHeaders,
  usePathParams,
  useQueryParam,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config?.REGION, Table?.app.tableName);
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const queryDomain = useQueryParam('domain');
    const headers = useHeaders();
    const domain = queryDomain ?? new URL(headers?.origin ?? '').hostname;
    console.log(domain);
    try {
      const res = await appDb.entities.orgs.scan
        // .where((org, { eq }) => eq(org?.domain, domain))
        .go();
      console.log(res);
      if (res.data?.[0]) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data?.[0]),
        };
      }
      return {
        statusCode: 404,
        body: `No org with domain: ${domain} exists. `,
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
