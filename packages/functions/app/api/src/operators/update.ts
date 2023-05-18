import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { UpdateOperator } from '../../../../../../stacks/entities/entities';
import { appDb } from '../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, operatorId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      ...updateOperator
    }: UpdateOperator = useJsonBody();

    if (!orgId || !operatorId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const res = await appDb(Table.app.tableName)
        .entities.operators.patch({
          orgId,
          operatorId,
        })
        .set({ ...updateOperator })
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
