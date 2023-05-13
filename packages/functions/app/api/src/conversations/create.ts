import { ApiHandler, useJsonBody } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../db';
import { CreateConversation } from '../../../../../../stacks/entities/entities';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const body: CreateConversation = useJsonBody();
    try {
      const res = await appDb.entities.conversations
        .create({
          ...body,
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
