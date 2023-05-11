import { ApiHandler, useJsonBody, useBody, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../db';
import { CreateConversation } from '../../../../../../stacks/entities/entities';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (evt) => {
    const body: CreateConversation = useBody();
    console.log(body);
    try {
      await appDb.entities.conversations
        .create({
          ...body,
        })
        .go();
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: evt.requestContext.time,
      };
    }

    return {
      statusCode: 200,
      body: evt.requestContext.time,
    };
  })
);
