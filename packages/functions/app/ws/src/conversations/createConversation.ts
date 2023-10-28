import { SNSEvent, SQSEvent, StreamRecord } from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Conversation, ExpandedConversation } from '@/entities/conversation';
import { expandObjects } from 'packages/functions/app/api/src/util/expandObjects';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

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
        .where(({ permissionTier, operatorId, connectionId }, { eq, ne }) => {
          // if not unassigned conversation, only notify relevant connected operator and superusers
          if (conversationData?.status !== 'unassigned') {
            return `${ne(connectionId, '')} AND ${eq(
              permissionTier,
              'admin',
            )} OR ${eq(permissionTier, 'owner')} OR ${eq(
              permissionTier,
              'moderator',
            )} OR ${
              conversationData?.operatorId
                ? eq(operatorId, conversationData.operatorId)
                : ''
            }`;
          }
          // if unassigned, notify all connected operators
          return `${ne(connectionId, '')}`;
        })
        .go();

      const customer = await appDb.entities.customers.query
        .primary({ orgId, customerId: customerId ?? '' })
        .where(({ connectionId }, { ne }) => `${ne(connectionId, '')}`)
        .go();

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
        [...operators?.data, ...customer.data],
        { type: WsAppDetailType.wsAppCreateConversation, body: expandedData },
      );

      return { statusCode: 200, body: 'Message sent' };
    }
  } catch (err: any) {
    Sentry.captureException(err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
});

export const handler = middy(lambdaHandler).use(eventNormalizer());
