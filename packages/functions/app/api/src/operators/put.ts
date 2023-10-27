import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { CreateOperator } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const { orgId, operatorId } = usePathParams();
      const body: CreateOperator = useJsonBody();
      if (!orgId || !operatorId) {
        return {
          statusCode: 422,
          body: 'Failed to parse an id from the url.',
        };
      }
      const res = await appDb.entities.operators
        .put({
          ...body,
          orgId,
          operatorId,
        })
        .go();
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
