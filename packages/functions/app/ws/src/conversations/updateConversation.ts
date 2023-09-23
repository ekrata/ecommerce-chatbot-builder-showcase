import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { expandObjects } from 'packages/functions/app/api/src/util/expandObjects';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Conversation, ExpandedConversation } from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../../api/src/db';
import { postToConnection } from '../postToConnection';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event: any, context) => {
    try {
      const newImage = DynamoDB.Converter.unmarshall(
        event?.detail?.dynamodb?.NewImage,
      );
      const conversationData = Conversation.parse({ Item: newImage }).data;
      if (!conversationData) {
        return {
          statusCode: 500,
          body: 'Failed to parse the eventbridge event into a usable entity.',
        };
      }
      const { orgId, operatorId, customerId, conversationId } =
        conversationData;

      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .go();

      const customer = await appDb.entities.customers.query
        .primary({ orgId, customerId: customerId ?? '' })
        .go();

      let filteredOperators = operators.data;

      // if not unassigned, send to operators that can view all messages, and the operator assigned to the conversation
      if (
        conversationData?.status !== 'unassigned' ||
        conversationData?.operatorId
      ) {
        filteredOperators = operators.data.filter(
          (operator) =>
            operator.permissionTier === 'owner' ||
            operator.permissionTier === 'admin' ||
            operator.permissionTier === 'operator' ||
            operator.permissionTier === 'moderator' ||
            operator.operatorId === operatorId,
        );
      }

      const expandedData = (
        await expandObjects(
          appDb,
          [conversationData],
          ['customerId', 'operatorId'],
        )
      )[0] as ExpandedConversation;

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...filteredOperators, ...customer.data],
        { type: 'updateConversation', body: expandedData },
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
