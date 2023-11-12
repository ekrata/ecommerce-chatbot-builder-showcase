import { SNSEventRecord, SQSEvent } from 'aws-lambda';
import { EntityItem } from 'electrodb';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { Message } from '@/entities/message';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../botStateContext';
import { publishToNextNodes } from '../publishToNextNodes';

const lambdaHandler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    const appDb = getAppDb(Config.REGION, Table.app.tableName);
    const { Records } = event;
    for (const record of Records) {
      console.log('mailing');
      const body = record?.body;
      const snsMessageId = record?.messageId;
      // console.log(record);
      // console.log((record.body as any)?.Message);
      const botStateContext: BotStateContext = (record.body as any)?.Message;
      const { type, bot, conversation, interaction, messages } =
        botStateContext;

      console.log(bot, bot.nodes, bot.edges);
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
          .go({ response: 'all_new' });

        const filteredMessages = messages
          ?.filter(
            (message) => message.messageId !== lastNodeMessage?.messageId,
          )
          .filter(Boolean);

        // console.log(JSON.parse(lastNodeMessage?.botStateContext ?? ''));

        await publishToNextNodes(
          {
            ...botStateContext,
            messages: [
              ...(filteredMessages ?? []),
              res?.data as EntityItem<typeof Message>,
            ],
          },
          appDb,
        );
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
