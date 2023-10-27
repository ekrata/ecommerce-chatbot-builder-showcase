import { SQSEvent } from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { WsAppDetailType } from '../../../../../../types/snsTypes';
import { getAppDb } from '../../../api/src/db';
import { getNewImage } from '../helpers';
import { postToConnection } from '../postToConnection';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

const lambdaHandler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    const { Records } = event;
    for (const record of Records) {
      const newImage = getNewImage(record);

      const messageData = Message.parse({ Item: newImage }).data;
      if (!messageData) {
        return {
          statusCode: 500,
          body: 'Failed to parse the eventbridge event into a usable entity.',
        };
      }

      const { orgId, operatorId, customerId, conversationId } = messageData;

      const conversation = await appDb.entities.conversations
        .get({ orgId, conversationId })
        .go();

      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .go();

      const customer = await appDb.entities.customers.query
        .primary({ orgId, customerId })
        .go();

      let filteredOperators = operators.data;

      // if not unassigned, send to operators that can view all messages, and the operator assigned to the conversation
      if (
        conversation.data?.status !== 'unassigned' ||
        conversation.data?.operatorId
      ) {
        filteredOperators = operators.data.filter(
          (operator) =>
            operator.permissionTier === 'admin' ||
            operator.permissionTier === 'moderator' ||
            operator.permissionTier === 'owner' ||
            operator.operatorId === conversation.data?.operatorId,
        );
      }

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...filteredOperators, ...customer.data],
        { type: WsAppDetailType.wsAppUpdateMessage, body: messageData },
      );

      return { statusCode: 200, body: 'Message sent' };
    }
  } catch (err) {
    console.log('err');
    console.log(err);
    Sentry.captureException(err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
});

export const handler = middy(lambdaHandler).use(eventNormalizer());
