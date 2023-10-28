import { DetailType } from 'aws-cdk-lib/aws-codestarnotifications';
import AWS from 'aws-sdk';
import { ApiHandler, usePathParams } from 'sst/node/api';
import { EventBus } from 'sst/node/event-bus';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent } from '@/entities/bot';
import { Message } from '@/entities/message';
import { ApiAppDetailType, WsAppDetailType } from '@/types/snsTypes';
import * as Sentry from '@sentry/serverless';

import { Action } from '../bots/triggers/definitions.type';
import { getNextNodes } from '../nodes/processInteraction';

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
            const messageData = Message.parse({
              Item: record.dynamodb.NewImage,
            }).data;

            // route responses to bot actions/conditions to the appropriate next node
            if (
              messageData?.messageFormType !== '' &&
              messageData?.sender === 'bot'
            ) {
              const botStateContext = messageData?.botStateContext;
              if (
                botStateContext?.currentNode &&
                botStateContext?.bot?.nodes &&
                botStateContext?.bot?.edges
              ) {
                const nextNodes = getNextNodes(
                  botStateContext?.currentNode?.id ?? '',
                  botStateContext?.bot?.nodes,
                  botStateContext?.bot?.edges,
                );
                nextNodes?.map(async (nextNode) => {
                  if (nextNode?.type) {
                    const nextNodeType = Object.entries(botNodeEvent).find(
                      ([key, value]) => {
                        if (value === nextNode.type) {
                          return botNodeEvent?.[
                            key as keyof typeof botNodeEvent
                          ];
                        }
                      },
                    ) as BotNodeEvent | undefined;
                    if (nextNodeType) {
                      console.log(nextNodeType);
                      await sns
                        .publish({
                          TopicArn: Topic?.BotNodeTopic?.topicArn,
                          Message: JSON.stringify({
                            ...botStateContext,
                            messages: [
                              ...(botStateContext?.messages ?? []),
                              messageData,
                            ],
                          }),
                          MessageAttributes: {
                            type: {
                              DataType: 'String',
                              StringValue: nextNodeType,
                            },
                          },
                          MessageStructure: 'string',
                        })
                        .promise();
                    }
                  }
                });
              }
            }

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
