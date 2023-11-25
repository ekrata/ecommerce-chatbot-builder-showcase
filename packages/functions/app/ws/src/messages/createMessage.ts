import { SQSEvent, SQSRecord, StreamRecord } from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import fsProm from 'fs/promises';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { WsAppDetailType } from '../../../../../../types/snsTypes';
import { getAppDb } from '../../../api/src/db';
import { getNewImage } from '../helpers';
import { postToConnection } from '../postToConnection';

const appDb = getAppDb(Config.REGION, Table.app.tableName);
const gateway = new ApiGatewayManagementApi({
  endpoint: WebSocketApi.appWs.httpsUrl,
  region: Config.REGION,
  maxRetries: 3,
});

const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent, context) => {
    try {
      console.log('duh');
      // await fsProm.writeFile('event.json', JSON.stringify(event));
      console.log(event);
      console.log(context);
      // context.callbackWaitsForEmptyEventLoop = false;
      const Records = event?.Records;
      // console.log('here', Records);
      if (Records?.length) {
        await Promise.all(
          Records?.map(async (record) => {
            const newImage = getNewImage(record);
            console.log(newImage);
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

            console.log(conversation);

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
            // filter recipitents
            const customer = await appDb.entities.customers.query
              .primary({ orgId, customerId })
              .go();

            console.log(customer);
            await postToConnection(
              appDb,
              gateway,
              [...operators.data, ...customer.data].filter(
                (person) => person.connectionId,
              ),
              { type: WsAppDetailType.wsAppCreateMessage, body: messageData },
            );

            return { statusCode: 200, body: 'Message sent' };
          }),
        );
      }
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  },
);

export const handler = middy(lambdaHandler).use(eventNormalizer());
