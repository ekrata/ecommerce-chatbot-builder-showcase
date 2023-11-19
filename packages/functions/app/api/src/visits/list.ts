import { EntityItem } from 'electrodb';
import { ApiHandler, usePathParams, useQueryParam, useQueryParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { ExpandedVisit, Visit } from '@/entities/visit';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { expandObjects } from '../util/expandObjects';

const appDb = getAppDb(Config.REGION, Table.app.tableName);
const limit = 10;

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { customerId, cursor } = useQueryParams();
    const expansionFields = JSON.parse(
      useQueryParam('expansionFields') ?? '[]',
    );
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      console.log(customerId, orgId);
      let res: {
        data: (EntityItem<typeof Visit> | ExpandedVisit)[];
        cursor: string | null;
      };
      if (customerId) {
        res = await appDb.entities.visits.query
          .byCustomerId({ orgId, customerId })
          .go(
            cursor
              ? { cursor, limit, order: 'desc' }
              : { limit, order: 'desc' },
          );
      }
      res = await appDb.entities.visits.query
        .byOrg({ orgId })
        .go(
          cursor ? { cursor, limit, order: 'desc' } : { limit, order: 'desc' },
        );

      if (expansionFields) {
        res = {
          data: (await expandObjects(appDb, res.data ?? {}, [
            'customerId',
          ])) as unknown as ExpandedVisit[],
          cursor: res?.cursor ?? null,
        };
        return {
          statusCode: 200,
          body: JSON.stringify(res),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(res),
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
