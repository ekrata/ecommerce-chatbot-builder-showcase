import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { getAppDb } from '../../../api/src/db';
import { postToConnection } from '../postToConnection';
import { WsAppMessage } from '../WsMessage';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event: any, context) => {
    console.log('creating message');
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

      const { orgId, customerId, conversationId } = messageData;
      const messageOperatorId = messageData.operatorId;

      const conversation = await appDb.entities.conversations
        .get({ orgId, conversationId })
        .go();
      //
      // console.log('hi', messageData, conversation?.data);
      // console.log('hi', conversation.data?.operatorId);
      // filter recipitents
      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .where(({ operatorId, permissionTier }, { eq, ne }) => {
          // if not unassigned conversation, only notify relevant connected operator and superusers
          if (conversation?.data?.status !== 'unassigned') {
            return `${eq(permissionTier, 'admin')} OR ${eq(
              permissionTier,
              'owner',
            )} OR ${eq(permissionTier, 'moderator')} OR ${eq(
              operatorId,
              messageOperatorId,
            )}`;
          }
          return ``;
        })
        .where(({ connectionId }, { ne }) => {
          return `${ne(connectionId, '')}`;
        })
        .go();

      console.log('ops', operators);

      // filter recipitents
      const customer = await appDb.entities.customers.query
        .primary({ orgId, customerId })
        .go();

      console.log(
        [...operators.data, ...customer.data].filter(
          (person) => person?.connectionId,
        ),
      );
      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...operators.data, ...customer.data].filter(
          (person) => person.connectionId,
        ),
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
