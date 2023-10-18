import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { Updateinteraction } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, interactionId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // createdAt,
      ...updateinteraction
    }: Updateinteraction = useJsonBody();

    if (!orgId || !interactionId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const res = await appDb.entities.interactions
        .patch({
          orgId,
          interactionId,
        })
        .set({ ...updateinteraction })
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
  }),
);