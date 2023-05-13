import {
  ApiHandler,
  useJsonBody,
  usePathParam,
  useQueryParams,
} from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../db';
import { CreateConversation } from '../../../../../../stacks/entities/entities';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (evt) => {
    const conversationId = usePathParam('id');
    const { orgId } = useQueryParams();
    if (!conversationId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.conversations
        .get({ orgId, conversationId })
        .go();
      if (res.data) {
        return {
          statusCode: 200,
          body: JSON.stringify(res?.data),
        };
      }
      return {
        statusCode: 404,
        body: `No conversation with conversationId: ${conversationId} and orgId: ${orgId} exists. `,
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: err,
      };
    }
  })
);
