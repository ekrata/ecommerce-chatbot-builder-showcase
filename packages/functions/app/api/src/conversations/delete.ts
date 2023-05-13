import { ApiHandler, usePathParam, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const conversationId = usePathParam('id');
    const { orgId } = useQueryParams();
    if (!conversationId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const data = await appDb.entities.conversations
        .remove({ orgId, conversationId })
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
