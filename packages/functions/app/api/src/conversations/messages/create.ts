import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { CreateMessage } from '../../../../../../../stacks/entities/entities';
import { appDb } from '../../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId, messageId } = usePathParams();
    const body: CreateMessage = useJsonBody();
    if (!orgId || !conversationId || !messageId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb(Table.app.tableName)
        .entities.messages.create({
          ...body,
          orgId,
          conversationId,
          messageId,
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
