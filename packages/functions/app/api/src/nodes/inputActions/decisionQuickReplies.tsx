import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { botNodeEvent, BotNodeType } from '@/entities/bot';
import {
  AskAQuestionData
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import {
  DecisionQuickRepliesData
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionQuickReplies';
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
      console.log('quickreplies', Records)
      for (const record of Records) {
        const snsMessageId = record.messageId;
        const botStateContext: BotStateContext = (
          record.body as unknown as SNSMessage
        )?.Message as unknown as BotStateContext;
        const { type, bot, conversation, nextNode, interaction, currentNode } =
          botStateContext;

        const { orgId, conversationId, botId, customerId, operatorId } =
          conversation;
        const { id, position, data } = currentNode as BotNodeType;
        // data is double stringified here for some reason ignore
        const quickRepliesData = JSON.parse(data ?? '{}') as DecisionQuickRepliesData
        console.log(quickRepliesData)
        console.log('typeof', typeof quickRepliesData)
        const initiateDate = Date.now() - 10000


        await appDb.transaction.write(({ messages }) => [
          messages.upsert({
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            content: quickRepliesData.message,
            createdAt: initiateDate,
            sentAt: initiateDate,
          }).commit(),
          messages.upsert({
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            messageFormType: botNodeEvent.DecisionQuickReplies,
            messageFormData: data,
            content: '',
            createdAt: initiateDate + 10000,
            sentAt: initiateDate + 10000,
            botStateContext: JSON.stringify({
              ...botStateContext,
            } as BotStateContext)
          }).commit()
        ]).go({})

        return {
          statusCode: 200,
          body: '',
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
