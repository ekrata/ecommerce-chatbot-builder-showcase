import { DetailType } from 'aws-cdk-lib/aws-codestarnotifications';
import AWS from 'aws-sdk';
import { ApiHandler, usePathParams } from 'sst/node/api';
import { EventBus } from 'sst/node/event-bus';
import { Topic } from 'sst/node/topic';

import { ApiAppDetailType, WsAppDetailType } from '@/types/snsTypes';
import * as Sentry from '@sentry/serverless';

const sns = new AWS.SNS();

// const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event: any, ctx) => {
    try {
      // eslint-disable-next-line no-use-before-define
      event?.Records?.forEach(async (record: any) => {
        // eslint-disable-next-line no-use-before-define
        console.log(record.eventName, record.dynamodb.NewImage.__edb_e__?.S);
        // CREATE
        if (record.eventName === 'INSERT') {
          if (
            record.dynamodb.NewImage.context?.S === 'interaction' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'interaction'
          ) {
            console.log('we are in');
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: ApiAppDetailType.apiAppCreateInteraction,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }

          if (
            record.dynamodb.NewImage.context?.S === 'message' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'message'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppCreateMessage,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }

          if (
            record.dynamodb.NewImage.context?.S === 'conversation' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'conversation'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppCreateConversation,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }

          if (
            record.dynamodb.NewImage.context?.S === 'operator' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'operator'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppCreateOperator,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }

          if (
            record.dynamodb.NewImage.context?.S === 'customer' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'customer'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppCreateCustomer,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }

          if (
            record.dynamodb.NewImage.context?.S === 'visit' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'visit'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppCreateVisit,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }
        }

        // UPDATE
        if (record.eventName === 'MODIFY') {
          if (
            record.dynamodb.NewImage.context?.S === 'message' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'message'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppUpdateMessage,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }
          if (
            record.dynamodb.NewImage.context?.S === 'conversation' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'conversation'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppUpdateConversation,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }
          if (
            record.dynamodb.NewImage.context?.S === 'operator' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'operator'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppUpdateOperator,
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }
          if (
            record.dynamodb.NewImage.context?.S === 'customer' ||
            record.dynamodb.NewImage.__edb_e__?.S === 'customer'
          ) {
            await sns
              .publish({
                TopicArn: Topic.DdbStreamTopic.topicArn,
                Message: JSON.stringify(record),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: WsAppDetailType.wsAppUpdateCustomer,
                  },
                },
                MessageStructure: 'string',
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
