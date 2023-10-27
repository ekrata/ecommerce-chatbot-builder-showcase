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
      const { orgId, operatorId } = operatorData;

      const operators = await appDb.entities.operators.query
        .byOrg({ orgId })
        .where(({ connectionId }, { ne }) => {
          return `${ne(connectionId, '')}`;
        })
        .go();

      // when operators go offline/are updated, we want those operator changes pushed to connected customers that are in a conversation with the operator

      const conversations = await appDb.entities.conversations.query
        .assigned({
          orgId,
          operatorId,
        })
        .go();

      console.log(conversations);

      const customers = (
        await Promise.all(
          conversations?.data
            .flatMap(async ({ customerId }) => {
              // get connected customers
              if (customerId) {
                return (
                  await appDb.entities.customers.query
                    .primary({
                      orgId,
                      customerId,
                    })
                    .where(
                      ({ connectionId }, { ne }) => `${ne(connectionId, '')}`,
                    )
                    .go()
                )?.data;
              } else return [];
            })
            .flat()
            .filter(Boolean),
        )
      ).flat();
      console.log('customerzzz', customers);
      let filteredOperators = operators.data;

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...filteredOperators, ...customers],
        { type: WsAppDetailType.wsAppUpdateOperator, body: operatorData },
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
