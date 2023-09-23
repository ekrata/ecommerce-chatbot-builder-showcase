import { Entity, EntityItem } from 'electrodb';
import { ApiHandler, usePathParams, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { ExpandedConversation } from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { expandObjects } from '../util/expandObjects';

export interface DbRes<T extends Entity<any, any, any, any>> {
  data: EntityItem<T>;
  cursor: string | null;
}
const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, visitId } = usePathParams();
    const expansionFields = JSON.parse(
      useQueryParam('expansionFields') ?? '[]',
    );
    if (!visitId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.visits.get({ orgId, visitId }).go();

      if (!res.data) {
        return {
          statusCode: 404,
          body: `No conversation with visitId: ${visitId} and orgId: ${orgId} exists. `,
        };
      }
      if (expansionFields) {
        const expandedData = (
          await expandObjects(appDb, [res.data ?? {}], expansionFields)
        )[0];
        return {
          statusCode: 200,
          body: JSON.stringify(expandedData),
        };
      }
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
