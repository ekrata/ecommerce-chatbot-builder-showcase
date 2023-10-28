import { SQSEvent } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../processInteraction';

const lambdaHandler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    const appDb = getAppDb(Config.REGION, Table.app.tableName);
    const { Records } = event;
    for (const record of Records) {
      const body = record?.body;
      const snsMessageId = record?.messageId;
      const botStateContext: BotStateContext = JSON.parse(record?.body);
      const { type, bot, conversation, interaction, messages } =
        botStateContext;

      const { orgId } = conversation;
      // const { id, position, data } = nextNode;
      // const params = {};
      const lastNodeMessage = messages?.slice(-1)[0];
      if (lastNodeMessage?.content) {
        const res = await appDb.entities.customers
          .update({
            customerId: lastNodeMessage?.customerId,
            orgId,
          })
          .set({ mailingSubscribed: true })
          .go();
      }
      return {
        statuscode: 200,
        body: `Successfully subscribed ${lastNodeMessage?.customerId} to mailing list`,
      };
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
});

export const handler = middy(lambdaHandler).use(eventNormalizer());
