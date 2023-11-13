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
import { formatMessage } from '../formatMessage';

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
        const { data } = currentNode as BotNodeType;
        const askAQuestionData = JSON.parse(
          currentNode?.data ?? '{}',
        ) as AskAQuestionData;
        console.log(data);

        const initiateAt = Date.now() - 10000;

        const questionMessage = await formatMessage(
          askAQuestionData?.message ?? '',
          botStateContext,
          appDb,
        );

        await appDb.entities.messages
          ?.upsert({
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            content: questionMessage,
            createdAt: initiateAt,
            sentAt: initiateAt,
          })
          .go();

        await appDb.entities?.messages
          .upsert({
            messageId: uuidv4(),
            conversationId,
            orgId,
            operatorId: operatorId ?? '',
            customerId: customerId ?? '',
            sender: 'bot',
            content: '',
            messageFormType: botNodeEvent.AskAQuestion,
            messageFormData: data,
            createdAt: initiateAt + 10000,
            sentAt: initiateAt + 10000,
            botStateContext: JSON.stringify({
              ...botStateContext,
            } as BotStateContext),
          })
          .go({});
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
