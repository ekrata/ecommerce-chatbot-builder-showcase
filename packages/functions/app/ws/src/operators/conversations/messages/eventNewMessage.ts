import { DynamoDB, ApiGatewayManagementApi, AWSError } from 'aws-sdk';
import { Table } from 'sst/node/table';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { EntityItem } from 'electrodb';
import { getAppDb } from '../../../../../api/src/db';
import { Config } from 'sst/node/config';
import { Message } from '../../../../../../../../stacks/entities/message';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event) => {
    const { orgId, customerId, connectionId } = usePathParams();
    if (!orgId || !customerId || !connectionId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    const messageData: EntityItem<typeof Message> = useJsonBody();
    const { stage, domainName } = event.requestContext;

    const apiG = new ApiGatewayManagementApi({
      endpoint: `${domainName}/${stage}`,
    });

    const postToConnection = async () => {
      try {
        // Send the message to the given client
        await apiG
          .postToConnection({ ConnectionId: connectionId, Data: messageData })
          .promise();
        return {
          statusCode: 200,
          body: 'Connection expired. ',
        };
      } catch (e) {
        if ((e as AWSError).statusCode === 410) {
          const res = await appDb.entities.customers
            .patch({ orgId, customerId })
            .set({ connectionId: '' })
            .go();
          return {
            statusCode: 410,
            body: 'Connection expired. ',
          };
        }
        return {
          statusCode: 500,
          body: JSON.stringify(e),
        };
      }
    };

    // Iterate through all the connections
    // await Promise.all(connections?.Items?.map(postToConnection));
    postToConnection();

    return { statusCode: 200, body: 'Message sent' };
  })
);
