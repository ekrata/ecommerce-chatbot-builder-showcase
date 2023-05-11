import 'server-only';
import { ApiHandler, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { appDb } from '../../../../../../stacks/AppStack';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (evt) => {
    const { orgId } = useQueryParams();
    try {
      const conversations = await appDb.collections.conversationList({ orgId });
      console.log(conversations);
    } catch (err) {
      Sentry.captureException(err);
    }

    return {
      statusCode: 200,
      body: evt.requestContext.time,
    };
  })
);
