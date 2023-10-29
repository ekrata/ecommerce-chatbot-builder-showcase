import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';
import { v5 as uuidv5 } from 'uuid';

import { botNodeEvent } from '@/entities/bot';
import { MessageFormType } from '@/entities/message';
import {
  AskAQuestionData
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';

const sns = new AWS.SNS();

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const botStateContext: BotStateContext = useJsonBody()

      // (botStateContext.currentNode?.data as MessageFormType)?.retries
      await sns
        .publish({
          TopicArn: Topic?.BotNodeTopic?.topicArn,
          Message: JSON.stringify({
            ...botStateContext,
            type: botStateContext.currentNode.type,
            currentNode: {
              ...botStateContext.currentNode, retries: botStateContext?.currentNode?.retries + 1
            }
          } as BotStateContext),
          MessageAttributes: {
            type: {
              DataType: 'String',
              StringValue: botStateContext.currentNode.type,
            },
          },
          MessageStructure: 'string',
        })
        .promise();
    }
    catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }));

