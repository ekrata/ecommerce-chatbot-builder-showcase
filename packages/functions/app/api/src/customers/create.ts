import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { CreateCustomer } from '../../../../../../stacks/entities/entities';
import { Config } from 'sst/node/config';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, customerId } = usePathParams();
    const body: CreateCustomer = useJsonBody();
    if (!orgId || !customerId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.customers
        .create({
          ...body,
          orgId,
          customerId,
        })
        .go();
      return {
        statusCode: 200,
        body: JSON.stringify(res.data),
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
