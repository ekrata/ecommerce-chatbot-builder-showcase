import { SNSEvent } from 'aws-lambda';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { botNodeEvent } from '@/entities/bot';
import { MessageFormType, messageFormType } from '@/entities/message';
import * as Sentry from '@sentry/serverless';

import { CreateBot } from '../../../../../../../stacks/entities/entities';
import { getAppDb } from '../../db';
import { BotStateContext } from '../processInteraction';

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SNSEvent) => {
  try {
    const appDb = getAppDb(Config.REGION, Table.app.tableName);
    event.Records.map(async (record) => {
      const message: BotStateContext = JSON.parse(record.Sns.Message);
      const { type, bot, conversation, nextNode, nodeContext, currentNode } =
        message;

      const { orgId, conversationId, botId, customerId, operatorId } =
        conversation;
      const { id, position, data } = nextNode;
      const res = await appDb.entities.messages
        .upsert({
          conversationId,
          botId,
          orgId,
          operatorId,
          customerId,
          sender: 'bot',
          content: '',
          messageFormType: botNodeEvent.AskAQuestion,
          messageFormData: JSON.stringify(data),
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
});
