import { ApiHandler, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { appDb } from '../../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId, messageId } = usePathParams();
    if (!conversationId || !orgId || !messageId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb(Table.app.tableName)
        .entities.messages.get({ orgId, conversationId, messageId })
        .go();
      if (res.data) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      return {
        statusCode: 404,
        body: `No conversation with conversationId: ${conversationId}, orgId: ${orgId} and messageId: ${messageId} exists.`,
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
