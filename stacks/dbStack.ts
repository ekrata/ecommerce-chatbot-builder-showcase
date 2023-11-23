import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FilterOrPolicy, SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import { Duration, RemovalPolicy } from 'aws-cdk-lib/core';
import {
  Api,
  ApiRouteProps,
  Auth,
  Bucket,
  Config,
  EventBus,
  EventBusRuleProps,
  FunctionInlineDefinition,
  NextjsSite,
  Queue,
  StackContext,
  StaticSite,
  Table,
  Topic,
  TopicFunctionSubscriberProps,
  TopicQueueSubscriberProps,
  use,
  WebSocketApi,
  WebSocketApiFunctionRouteProps,
} from 'sst/constructs';

import { paramStack } from './paramStack';

export function dbStack({ stack, app }: StackContext) {
  if (app.stage !== 'prod') {
    app.setDefaultRemovalPolicy('destroy');
  }

  const { REGION, defaultFunctionTimeout, ddbStreamTopic, botNodeTopic } =
    use(paramStack);

  console.log(app?.stage);
  const table = new Table(stack, `app`, {
    fields: {
      pk: 'string',
      sk: 'string',
      gsi1pk: 'string',
      gsi1sk: 'string',
      gsi2pk: 'string',
      gsi2sk: 'string',
      gsi3pk: 'string',
      gsi3sk: 'string',
    },
    primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
    globalIndexes: {
      'gsi1pk-gsi1sk-index': {
        partitionKey: 'gsi1pk',
        sortKey: 'gsi1sk',
        projection: 'all',
      },
      'gsi2pk-gsi2sk-index': {
        partitionKey: 'gsi2pk',
        sortKey: 'gsi2sk',
        projection: 'all',
      },
      'gsi3pk-gsi3sk-index': {
        partitionKey: 'gsi3pk',
        sortKey: 'gsi3sk',
        projection: 'all',
      },
    },
    stream: true,
    cdk: {
      table: {
        removalPolicy:
          app.stage !== 'prod' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
    consumers: {
      consumer1: {
        function: {
          permissions: ['sns:Publish'],
          handler:
            'packages/functions/app/api/src/ddb-stream/processBatch.handler',
          timeout: parseInt(defaultFunctionTimeout.value),
        },
        cdk: {
          eventSource: {
            startingPosition: lambda.StartingPosition.LATEST,
          },
        },
      },
    },
  });

  table.bindToConsumer('consumer1', [
    table,
    ddbStreamTopic,
    botNodeTopic,
    REGION,
  ]);

  return { table };
}
