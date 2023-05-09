import { ApiHandler, useJsonBody, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../../../../../stacks/AppStack';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (evt) => {
    const body = useJsonBody();
    console.log(body);
    try {
      return await appDb.entities.conversations
        .create({
          ...body,
        })
        .go();
    } catch (err) {
      Sentry.captureException(err);
    }

    return {
      statusCode: 200,
      body: evt.requestContext.time,
    };
  })
);
