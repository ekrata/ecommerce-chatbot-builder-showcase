import { SQSEvent } from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Visit } from '@/entities/visit';
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
      const visitData = Visit.parse({ Item: newImage }).data;
      if (!visitData) {
        return {
          statusCode: 500,
          body: `Failed to parse the ${record.messageId} into a usable entity.`,
        };
      }
      const { orgId, customerId } = visitData;

      // get operators assigned to customer so we can let them know their customer has visited a new page
      // const conversations = await appDb.entities.conversations.query
      //   .byOrg({ orgId })
      //   .where(
      //     ({ customerId, status }, { eq }) =>
      //       `${eq(customerId, visitData.customerId)} AND ${eq(status, 'open')}`,
      //   )
      //   .go();

      // const operatorIds = conversations?.data?.map(
      //   (conversation) => conversation?.operatorId,
      // );

      // get operators from ids

      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .where(({ connectionId }, { ne }) => `${ne(connectionId, '')}`)
        .go();

      console.log(operators);
      // Presently, we only want to notify new visits for current, open conversations.
      // Other cases are simply updated when querying from client.

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...operators?.data],
        { type: WsAppDetailType.wsAppCreateVisit, body: visitData },
      );

      return { statusCode: 200, body: 'Message sent' };
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
});

export const handler = middy(lambdaHandler).use(eventNormalizer());
