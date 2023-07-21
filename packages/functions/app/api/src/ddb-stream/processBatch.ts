import AWS from 'aws-sdk';
import { ApiHandler, usePathParams } from 'sst/node/api';

import * as Sentry from '@sentry/serverless';

const client = new AWS.EventBridge();

// const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event, ctx, callback) => {
    const { orgId, operatorId } = usePathParams();
    if (!operatorId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    event.Records.forEach(async (record: object) => {
      try {
        console.log('Stream record: ', JSON.stringify(record, null, 2));
        console.log(...record);
        if (record.eventName === 'INSERT') {
          const entries = await client
            .putEvents({
              Entries: [
                {
                  EventBusName: 'app',
                  Source: 'ddbStream',
                  DetailType: 'sendNewMessageToCustomer',
                  Detail: JSON.stringify(record.dynamodb.newImage),
                },
              ],
            })
            .promise();
          console.log(record.dynamodb);
          console.log(record.dynamodb.NewImage);
          const who = JSON.stringify(record.dynamodb.NewImage.Username.S);
          const when = JSON.stringify(record.dynamodb.NewImage.Timestamp.S);
          const what = JSON.stringify(record.dynamodb.NewImage.Message.S);
        }
        if (record.eventName === 'UPDATE') {
          const entries = await client
            .putEvents({
              Entries: [
                {
                  EventBusName: 'app',
                  Source: 'ddbStream',
                  DetailType: 'sendNewMessageToCustomer',
                  Detail: JSON.stringify(record.dynamodb.newImage),
                },
              ],
            })
            .promise();
          console.log(record.dynamodb);
          console.log(record.dynamodb.NewImage);
          const who = JSON.stringify(record.dynamodb.NewImage.Username.S);
          const when = JSON.stringify(record.dynamodb.NewImage.Timestamp.S);
          const what = JSON.stringify(record.dynamodb.NewImage.Message.S);
        }
        if (record.eventName === 'DELETE') {
          const entries = await client
            .putEvents({
              Entries: [
                {
                  EventBusName: 'app',
                  Source: 'ddbStream',
                  DetailType: 'sendNewMessageToCustomer',
                  Detail: JSON.stringify(record.dynamodb.newImage),
                },
              ],
            })
            .promise();
          console.log(record.dynamodb);
          console.log(record.dynamodb.NewImage);
          const who = JSON.stringify(record.dynamodb.NewImage.Username.S);
          const when = JSON.stringify(record.dynamodb.NewImage.Timestamp.S);
          const what = JSON.stringify(record.dynamodb.NewImage.Message.S);
        }
      } catch (err) {
        Sentry.captureException(err);
        return {
          statusCode: 500,
          body: JSON.stringify(err),
        };
      }
      callback(null, `Successfully processed ${event.Records.length} records.`);
    });
  }),
);
