import AWS from 'aws-sdk';
import { ApiHandler, usePathParams } from 'sst/node/api';
import { EventBus } from 'sst/node/event-bus';

import * as Sentry from '@sentry/serverless';

const client = new AWS.EventBridge();

// const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event, ctx) => {
    try {
      event?.Records?.forEach(async (record: object) => {
        // CREATE
        if (record.eventName === 'INSERT') {
          if (record.dynamodb.NewImage.context?.S === 'message') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'createMessage',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }

          if (record.dynamodb.NewImage.context?.S === 'conversation') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'createConversation',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }

          if (record.dynamodb.NewImage.context?.S === 'operator') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'createOperator',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }

          if (record.dynamodb.NewImage.context?.S === 'customer') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'createCustomer',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }
        }

        // UPDATE
        if (record.eventName === 'UPDATE') {
          if (record.dynamodb.NewImage.context?.S === 'message') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'updateMessage',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }
          if (record.dynamodb.NewImage.context?.S === 'conversation') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'updateConversation',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }
          if (record.dynamodb.NewImage.context?.S === 'operator') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'updateOperator',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }
          if (record.dynamodb.NewImage.context?.S === 'customer') {
            const entries = await client
              .putEvents({
                Entries: [
                  {
                    EventBusName: EventBus.appEventBus.eventBusName,
                    Source: 'ddbStream',
                    DetailType: 'updateCustomer',
                    Detail: JSON.stringify(record),
                  },
                ],
              })
              .promise();
          }
        }
      });
      return {
        statusCode: 200,
        body: '',
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
