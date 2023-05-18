import { ApiHandler, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { appDb } from '../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      // await appDb(Table.app.tableName).transaction
      //   .write(({ orgs, conversations, messages, operators, customers }) => [
      //    conversations
      //       .delete({orgId})
      //       .commit({ response: 'all_old' }),

      //     entity2
      //       .update({ prop1: 'value1', prop2: 'value2' })
      //       .set({ prop3: 'value3' })
      //       .commit({ response: 'all_old' }),
      //   ])
      //   .go();
      const data = await appDb(Table.app.tableName)
        .entities.orgs.remove({ orgId })
        .go();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
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
