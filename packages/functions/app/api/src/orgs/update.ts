import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { UpdateOrg } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      ...updateOrg
    }: UpdateOrg = useJsonBody();

    if (!orgId || !updateOrg) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const res = await appDb.entities.orgs
        .patch({
          orgId,
        })
        .set({ ...updateOrg })
        .go();
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
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
