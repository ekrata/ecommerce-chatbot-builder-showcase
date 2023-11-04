import {
  SNSEvent,
  SNSEventRecord,
  SNSMessage,
  SQSEvent,
  StreamRecord,
} from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Conversation } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Interaction } from '@/entities/interaction';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { WsAppDetailType } from '../../../../../../types/snsTypes';
import { getAppDb } from '../../../api/src/db';
import { getNewImage } from '../helpers';
import { postToConnection } from '../postToConnection';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      console.log(event);
      const { Records } = event;
      for (const record of Records) {
        console.log(record?.body);
        const interactionData = (record?.body as unknown as SNSMessage)
          ?.Message as unknown as EntityItem<typeof Interaction>;
        console.log(interactionData);
        if (!interactionData) {
          return {
            statusCode: 500,
            body: 'Failed to parse the eventbridge event into a usable entity.',
          };
        }
        const { orgId, customerId, operatorId } = interactionData;

        // const operator = await appDb.entities.operators
        //   .get({ orgId, operatorId })
        //   .go();

        const customer = await appDb.entities.customers
          .get({ orgId, customerId: customerId })
          .go();

        console.log(customer);
        if (customer?.data) {
          await postToConnection(
            appDb,
            new ApiGatewayManagementApi({
              endpoint: WebSocketApi.appWs.httpsUrl,
            }),
            [customer?.data],
            {
              type: WsAppDetailType.wsAppTriggerStarted,
              body: interactionData,
            },
          );

          return { statusCode: 200, body: 'Message sent' };
        }
      }
    } catch (err) {
      console.log('err');
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  },
);

export const handler = middy(lambdaHandler).use(eventNormalizer());
