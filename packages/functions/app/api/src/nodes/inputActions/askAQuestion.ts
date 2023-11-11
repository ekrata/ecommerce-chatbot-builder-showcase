import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { botNodeEvent, BotNodeType } from '@/entities/bot';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../botStateContext';

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
        // const { id,  } = currentNode as BotNodeType;
        const data = JSON.parse(currentNode?.data ?? '{}') as AskAQuestionData;
        console.log(data);

        const initiateAt = Date.now() - 5000;
        const res2 = await appDb.entities.messages
          .upsert({
            // messageId based on idempotent interactionId
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            content: data?.message,
            createdAt: initiateAt,
            sentAt: initiateAt,
            // don't need to modify
            // botStateContext: JSON.stringify(botStateContext),
          })
          .go({ response: 'all_new' });
        // const nextBotStateContext = getNextBotStateContext(botStateContext);

        const res = await appDb.entities.messages
          .upsert({
            // messageId based on idempotent interactionId
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            content: '',
            messageFormType: botNodeEvent.AskAQuestion,
            messageFormData: JSON.stringify(data),
            createdAt: initiateAt + 5000,
            sentAt: initiateAt + 5000,
            // don't need to modify
            // increment currentNode/nextNode
            botStateContext: JSON.stringify({
              ...botStateContext,
              type: nextNode?.type,
              currentNode: nextNode,
              nextNode: {},
            } as BotStateContext),
          })
          .go({ response: 'all_new' });
        return {
          statusCode: 200,
          body: JSON.stringify(res.data),
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
