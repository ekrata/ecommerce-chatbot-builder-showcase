import { SQSEvent } from 'aws-lambda';
import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Conversation } from '@/entities/conversation';
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
      const operatorData = Operator.parse({ Item: newImage }).data;
      if (!operatorData) {
        return {
          statusCode: 500,
          body: 'Failed to parse the eventbridge event into a usable entity.',
        };
      }
      const { orgId } = operatorData;

      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .where(({ connectionId }, { ne }) => {
          return `${ne(connectionId, '')}`;
        })
        .go();

      // operators changes apply on api calls
      let filteredOperators = operators.data;

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...filteredOperators],
        { type: WsAppDetailType.wsAppCreateOperator, body: operatorData },
      );

      return { statusCode: 200, body: 'Operator sent' };
    }
  } catch (err) {
    console.log('err');
    console.log(err);
    Sentry.captureException(err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
});

export const handler = middy(lambdaHandler).use(eventNormalizer());
