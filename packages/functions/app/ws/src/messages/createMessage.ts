import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { getAppDb } from '../../../api/src/db';
import { postToConnection } from '../postToConnection';
import { WsAppMessage } from '../WsMessage';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event: any, context) => {
    try {
      const newImage = DynamoDB.Converter.unmarshall(
        event.detail?.dynamodb?.NewImage,
      );

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
        .where(({ permissionTier, operatorId, connectionId }, { eq, ne }) => {
          // if not unassigned conversation, only notify relevant connected operator and superusers
          if (conversation.data?.status !== 'unassigned') {
            return `${ne(connectionId, '')} AND ${eq(
              permissionTier,
              'admin',
            )} OR ${eq(permissionTier, 'owner')} OR ${eq(
              permissionTier,
              'moderator',
            )} OR ${
              conversation.data?.operatorId
                ? eq(operatorId, conversation.data?.operatorId)
                : ''
            }`;
            // if unassigned, notify all connected operators
          }
          return `${ne(connectionId, '')}`;
        })
        .go();

      const customer = await appDb.entities.customers.query
        .primary({ orgId, customerId })
        .go();

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...operators.data, ...customer.data],
        { type: WsAppMessage.createMessage, body: messageData },
      );

      return { statusCode: 200, body: 'Message sent' };
    } catch (err) {
      console.log('err');
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }),
);
