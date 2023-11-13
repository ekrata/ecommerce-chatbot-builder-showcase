import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { EntityItem } from 'electrodb';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { botNodeEvent, BotNodeType } from '@/entities/bot';
import { Message } from '@/entities/message';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { CouponData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/CouponCode';
import { SendAChatMessageData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/SendAChatMessage';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { BotStateContext } from '../botStateContext';
import { formatMessage } from '../formatMessage';
import { publishToNextNodes } from '../publishToNextNodes';

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const { Records } = event;
      console.log(Records);
      for (const record of Records) {
        const botStateContext: BotStateContext = (
          record.body as unknown as SNSMessage
        )?.Message as unknown as BotStateContext;
        const { type, bot, conversation, nextNode, interaction, currentNode } =
          botStateContext;

        const { orgId, conversationId, botId, customerId, operatorId } =
          conversation;
        console.log(currentNode);
        const { id, position } = currentNode as BotNodeType;
        const data = JSON.parse(currentNode?.data ?? '{}') as CouponData;
        console.log('couponCode', data);

        const message = await formatMessage(
          `${data?.message} ${data?.couponCode}`,
          botStateContext,
          appDb,
        );

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
          })
          .go({ response: 'all_new' });

        await publishToNextNodes(
          {
            ...botStateContext,
            messages: [
              ...(botStateContext?.messages ?? []),
              res?.data as EntityItem<typeof Message>,
            ],
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
