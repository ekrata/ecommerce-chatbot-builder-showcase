import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { cursor } = useQueryParams();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.bots.query
        .byOrg({ orgId })
        .go(cursor ? { cursor, limit: 25 } : { limit: 25 });
      const bots = res.data;
      return {
        statusCode: 200,
        body: JSON.stringify(
          res?.data?.map((bot) => ({
            ...bot,
            nodes: bot?.nodes?.map((node) => ({
              ...node,
              data: JSON.parse(node?.data ?? '{}'),
            })),
            edges: bot?.edges?.map((edge) => ({
              ...edge,
              data: JSON.parse(edge?.data ?? '{}'),
            })),
          })),
        ),
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
