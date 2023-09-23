import { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
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
        .go();

      // when operators go offline/are updated, we want to those operator changes pushed to connected customers that are in a conversation with the operator

      const conversations = await appDb.entities.conversations.query
        .assigned({
          orgId,
          operatorId,
        })
        .go();

      let customers: EntityItem<typeof Customer>[] = [];
      conversations.data.map(async ({ customerId }) => {
        // get connected customers
        if (customerId) {
          customers = (
            await appDb.entities.customers.query
              .primary({
                orgId,
                customerId,
              })
              .where(({ connectionId }, { ne }) => `${ne(connectionId, '')}`)
              .go()
          )?.data;
        }
      });

      let filteredOperators = operators.data;

      await postToConnection(
        appDb,
        new ApiGatewayManagementApi({
          endpoint: WebSocketApi.appWs.httpsUrl,
        }),
        [...filteredOperators, ...customers],
        { type: 'updateOperator', body: operatorData },
      );

      return { statusCode: 200, body: 'Operator sent' };
    } catch (err) {
      console.log('err');
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }),
);
