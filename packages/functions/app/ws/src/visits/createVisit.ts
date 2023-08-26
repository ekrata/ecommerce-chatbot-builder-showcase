import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Conversation } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Visit } from '@/entities/visit';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { getAppDb } from '../../../api/src/db';
import { postToConnection } from '../postToConnection';
import { WsAppMessage } from '../WsMessage';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event, context) => {
    try {
      const newImage = DynamoDB.Converter.unmarshall(
        event?.detail?.dynamodb?.NewImage,
      );
      const visitData = Visit.parse({ Item: newImage }).data;
      if (!visitData) {
        return {
          statusCode: 500,
          body: {
            error:
              'Failed to parse the eventbridge event into a usable entity.',
          },
        };
      }
      const { orgId, customerId } = visitData;

      // get operators assigned to customer so we can let them know their customer has visited a new page
      const conversations = await appDb.entities.conversations.query
        .byOrg({ orgId })
        .where(
          ({ customerId, status }, { eq }) =>
            `${eq(customerId, visitData.customerId)} AND ${eq(status, 'open')}`,
        )
        .go();

      const operatorIds = conversations?.data?.map(
        (conversation) => conversation?.operatorId,
      );

      // get operators from ids

      const operators = await appDb.entities.operators
        .get(
          operatorIds.map((operatorId) => ({
            orgId,
            operatorId: operatorId ?? '',
          })),
        )
        .go();

      // Presently, we only want to notify new visits for current, open conversations.
      // Other cases are simply updated when querying from client.

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...operators?.data],
        { type: WsAppMessage.createVisit, body: visitData },
      );

      return { statusCode: 200, body: 'Message sent' };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }),
);
