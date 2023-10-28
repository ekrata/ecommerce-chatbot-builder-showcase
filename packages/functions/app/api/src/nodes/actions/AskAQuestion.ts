import { SNSEvent, SQSEvent } from 'aws-lambda';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v5 as uuidv5 } from 'uuid';

import {
    AskAQuestionData
} from '@/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { botNodeEvent } from '@/entities/bot';
import { MessageFormType, messageFormType } from '@/entities/message';
import * as Sentry from '@sentry/serverless';

import { CreateBot } from '../../../../../../../stacks/entities/entities';
import { getAppDb } from '../../db';
import { BotStateContext } from '../processInteraction';

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      event.Records.map(async (record) => {
        const snsMessageId = record.Sns.MessageId;
        const botStateContext: BotStateContext = JSON.parse(record.Sns.Message);
        const { type, bot, conversation, nextNode, interaction, currentNode } =
          botStateContext;

        const { orgId, conversationId, botId, customerId, operatorId } =
          conversation;
        const { id, position, data } = nextNode;
        const params = {};
        const res = await appDb.entities.messages
          .upsert({
            // messageId based on idempotent interactionId
            messageId: uuidv5(snsMessageId, orgId),
            conversationId,
            botId,
            orgId,
            operatorId,
            customerId,
            sender: 'bot',
            content: '',
            messageFormType: botNodeEvent.AskAQuestion,
            messageFormData: JSON.parse(data ?? '') as AskAQuestionData,
            // don't need to modify
            botStateContext: botStateContext,
          })
          .go();
        return {
          statusCode: 200,
          body: JSON.stringify(res.data),
        };
      });
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

export const handler = 
