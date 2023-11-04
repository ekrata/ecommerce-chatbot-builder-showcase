import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { botNodeEvent, BotNodeType } from '@/entities/bot';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { SendAChatMessageData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/SendAChatMessage';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../botStateContext';
import { publishToNextNodes } from '../publishToNextNodes';

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const { Records } = event;
      for (const record of Records) {
        const snsMessageId = record.messageId;
        const botStateContext: BotStateContext = (
          record.body as unknown as SNSMessage
        )?.Message as unknown as BotStateContext;
        const { type, bot, conversation, nextNode, interaction, currentNode } =
          botStateContext;

        const { orgId, conversationId, botId, customerId, operatorId } =
          conversation;
        console.log(currentNode);
        const { id, position, data } = currentNode as BotNodeType;
        const params = {};
        const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        // const resOne = await appDb.entities.messages;
        // const newid = uuidv5(`${snsMessageId}1`, orgId);
        // console.log(newid);

        const newMessages = await Promise.all(
          (data as unknown as SendAChatMessageData)?.messages.map(
            async (message) => {
              const res = await appDb.entities.messages
                .upsert({
                  // messageId based on idempotent interactionId
                  messageId: uuidv4(),
                  conversationId,
                  orgId,
                  operatorId: operatorId ?? '',
                  customerId: customerId ?? '',
                  sender: 'bot',
                  content: message,
                  createdAt: Date.now() - 1000,
                  sentAt: Date.now() - 1000,
                  // don't need to modify
                  // botStateContext: JSON.stringify(botStateContext),
                })
                .go({ response: 'all_new' });
              return res?.data;
              // const nextBotStateContext = getNextBotStateContext(botStateContext);
            },
          ),
        );

        publishToNextNodes(
          {
            ...botStateContext,
            messages: [...(botStateContext?.messages ?? []), ...newMessages],
          },
          appDb,
        );

        return {
          statusCode: 200,
          body: 'Sent messages',
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
  },
);

export const handler = middy(lambdaHandler).use(eventNormalizer());
