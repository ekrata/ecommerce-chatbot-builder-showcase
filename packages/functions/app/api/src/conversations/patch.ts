import { ApiHandler, useJsonBody } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { UpdateConversation } from '../../../../../../stacks/entities/entities';
import { appDb } from '../../db';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const {
      orgId,
      conversationId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      ...updateConversation
    }: UpdateConversation = useJsonBody();

    if (!orgId || !conversationId || !updateConversation) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      await appDb.entities.conversations
        .patch({
          orgId,
          conversationId,
        })
        .set({ ...updateConversation })
        .go();
      return {
        statusCode: 200,
        body: 'Updated conversation.',
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
