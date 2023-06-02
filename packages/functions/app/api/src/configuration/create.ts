import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { appDb } from '../db';
import { CreateConfiguration } from '@/entities/entities';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const body: CreateConfiguration = useJsonBody();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb(Table.app.tableName)
        .entities.configurations.create({
          ...body,
          orgId,
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
