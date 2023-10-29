import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v5 as uuidv5 } from 'uuid';

import { botNodeEvent } from '@/entities/bot';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../processInteraction';

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
        console.log(botStateContext);
        const { type, bot, conversation, nextNode, interaction, currentNode } =
          botStateContext;

        const { orgId, conversationId, botId, customerId, operatorId } =
          conversation;
        const { id, position, data } = nextNode;
        const params = {};
        const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        console.log(orgId);
        const resOne = await appDb.entities.messages
          .upsert({
            // messageId based on idempotent interactionId
            messageId: uuidv5(`${snsMessageId}1`, orgId),
            conversationId,
            botId,
            orgId,
            operatorId,
            customerId,
            sender: 'bot',
            content: (JSON.parse(data ?? '{}') as AskAQuestionData)?.message,
            // don't need to modify
            // botStateContext: JSON.stringify(botStateContext),
          })
          .go();
        const res = await appDb.entities.messages
          .upsert({
            // messageId based on idempotent interactionId
            messageId: uuidv5(`${snsMessageId}2`, orgId),
            conversationId,
            botId,
            orgId,
            operatorId,
            customerId,
            sender: 'bot',
            content: '',
            messageFormType: botNodeEvent.AskAQuestion,
            messageFormData: data,
            // don't need to modify
            botStateContext: JSON.stringify(botStateContext),
          })
          .go();
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
