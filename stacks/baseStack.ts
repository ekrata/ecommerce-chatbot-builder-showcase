import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FilterOrPolicy, SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import { IQueue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib/core';
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

import { ApiAppDetailType, WsAppDetailType } from '@/types/snsTypes';

import { dbStack } from './dbStack';
import { botNodeEvent } from './entities/bot';
import { getAllowedOrigins, paramStack } from './paramStack';

export function baseStack({ stack, app }: StackContext) {
  // const APP_API_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'https://rwys6ma2k3.execute-api.us-east-1.amazonaws.com',
  // });

  // const APP_WS_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'wss://etr95nhzwk.execute-api.us-east-1.amazonaws.com/local',
  // });

  const {
    appName,
    STAGE,
    domain,
    BEDROCK_AWS_REGION,
    REGION,
    tableName,
    frontendUrl,
    defaultFunctionTimeout: functionTimeoutConfig,
    allowedOrigins,
    oauthGoogleClientId,
    OPENAI_API_KEY,
    oauthGoogleSecret,
    faissLambdaConfig,
    stripeKeySecret,
    ddbStreamTopic,
    botNodeTopic,
    appEventBus,
    metaAppSecret,
    metaVerifySecret,
  } = use(paramStack);

  const defaultFunctionTimeout = parseInt(functionTimeoutConfig.value, 10);

  const { table } = use(dbStack);

  if (!app.local) {
    const sentry = lambda.LayerVersion.fromLayerVersionArn(
      stack,
      'SentryLayer',
      `arn:aws:lambda:${app.region}:943013980633:layer:SentryNodeServerlessSDK:175`,
    );
    stack.addDefaultFunctionLayers([sentry]);
    stack.addDefaultFunctionEnv({
      SENTRY_DSN: process.env.SENTRY_DSN ?? '',
      SENTRY_TRACES_SAMPLE_RATE: '1.0',
      NODE_OPTIONS: '-r @sentry/serverless/dist/awslambda-auto',
    });
  }

  if (app.local) {
    // const script = new Script(stack, "Script", {
    //   defaults: {
    //     function: {
    //       bind: [table],
    //     },
    //   },
    //   onCreate: "packages/functions/api/src/seed.handler",
    // });
  }

  // Create the WebSocket API
  // All are batch operations

  const wsApiRoutes:
    | Record<string, FunctionInlineDefinition | WebSocketApiFunctionRouteProps>
    | undefined = {
    [`${WsAppDetailType.wsAppCreateMessage}`]:
      'packages/functions/app/ws/src/messages/createMessage.handler',
    [`${WsAppDetailType.wsAppUpdateMessage}`]:
      'packages/functions/app/ws/src/messages/updateMessage.handler',

    [`${WsAppDetailType.wsAppCreateConversation}`]:
      'packages/functions/app/ws/src/conversations/createConversation.handler',
    [`${WsAppDetailType.wsAppUpdateConversation}`]:
      'packages/functions/app/ws/src/conversations/updateConversation.handler',

    [`${WsAppDetailType.wsAppCreateCustomer}`]:
      'packages/functions/app/ws/src/customers/createCustomer.handler',
    [`${WsAppDetailType.wsAppUpdateCustomer}`]:
      'packages/functions/app/ws/src/customers/updateCustomer.handler',

    [`${WsAppDetailType.wsAppCreateOperator}`]:
      'packages/functions/app/ws/src/operators/createOperator.handler',
    [`${WsAppDetailType.wsAppUpdateOperator}`]:
      'packages/functions/app/ws/src/operators/updateOperator.handler',

    [`${WsAppDetailType.wsAppCreateVisit}`]:
      'packages/functions/app/ws/src/visits/createVisit.handler',

    [`${WsAppDetailType.wsAppTriggerStarted}`]:
      'packages/functions/app/ws/src/interactions/triggerStarted.handler',

    $connect: 'packages/functions/app/ws/src/connect.handler',
    $default: 'packages/functions/app/ws/src/connect.handler',
    $disconnect: 'packages/functions/app/ws/src/disconnect.handler',
  };

  const wsApi = new WebSocketApi(stack, 'appWs', {
    customDomain: {
      domainName:
        stack.stage === 'prod'
          ? `ws-api.${domain.toLowerCase()}`
          : `${stack.stage.toLowerCase()}.ws-api.${domain.toLowerCase()}`,
      hostedZone: 'ekrata.com',
    },
    defaults: {
      function: {
        bind: [table, REGION, appEventBus, STAGE],
        permissions: [
          table,
          'sqs:ReceiveMessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
    routes: wsApiRoutes,
  });

  wsApi.bind([wsApi]);

  // Only need to be available locally, for seeding and dropping the test db
  const testRoutes: Record<string, ApiRouteProps<string>> = stack.stage ===
  'local'
    ? {
        'POST /util/seed-test-db':
          'packages/functions/app/api/src/util/seed.handler',
        'POST /util/small-seed-test-db':
          'packages/functions/app/api/src/util/smallSeed.handler',
        'POST /util/dense-seed-test-db':
          'packages/functions/app/api/src/util/denseSeed.handler',
        'POST /util/wipe-test-db':
          'packages/functions/app/api/src/util/wipe.handler',
      }
    : {};

  // Because the rules of the entire websocket API(Which is responsible for the real time messaging and notifications of the app))
  // are of the same, shared structure, we can simply build the eventbus rules dynamically from lambda names
  // const rules: Record<string, EventBusRuleProps> = wsApi.routes.reduce(
  //   (acc, route) => {
  //     const wsFunc = wsApi.getFunction(route);
  //     if (wsFunc) {
  //       return {
  //         ...acc,
  //         [`${wsFunc.id.split('$').slice(-1)[0]}-rule`]: {
  //           pattern: {
  //             source: ['ddbStream'],
  //             detailType: [wsFunc.id],
  //           },
  //           targets: {
  //             ws: {
  //               cdk: {
  //                 function: lambda.Function.fromFunctionArn(
  //                   stack,
  //                   wsFunc.id,
  //                   wsFunc.functionArn,
  //                 ),
  //               },
  //             },
  //           },
  //         },
  //       } as Record<string, EventBusRuleProps>;
  //     }
  //     throw new Error('Failed to get a function from the ws api');
  //   },
  //   {},
  // );

  // add rules
  // appEventBus.addRules(stack, { ...rules });

  // add permissions to allow eventbridge rules to invoke respective wsApi lambda.
  // wsApi.routes.map((route) => {
  //   const routeRuleKey = Object.keys(rules).find((rule) =>
  //     rule.includes(`${route.split('$').slice(-1)[0]}-rule`),
  //   );

  //   if (!routeRuleKey) {
  //     throw new Error('Failed to find a route rule key');
  //   }

  //   const routeRule = appEventBus.getRule(routeRuleKey);
  //   if (!routeRule) {
  //     throw new Error('Failed to find a route rule');
  //   }
  //   const fn = wsApi.getFunction(route);
  //   // fn?.addPermission(new iam.ServicePrincipal('events.amazonaws.com'));
  //   // fn?.attachPermissions(['events'])
  //   fn?.addPermission(`eb-invoke`, {
  //     action: 'lambda:InvokeFunction',
  //     principal: new iam.ServicePrincipal('events.amazonaws.com'),
  //     sourceArn: routeRule.ruleArn,
  //   });
  //   // wsApi.attachPermissionsToRoute(route, [
  //   //   new iam.PolicyStatement({
  //   //     actions: ['lambda:InvokeFunction'],
  //   //     effect: iam.Effect.ALLOW,
  //   //     principals: [new iam.ServicePrincipal('events.amazonaws.com')],
  //   //     resources: [routeRule.ruleArn],
  //   //   }),
  //   // ]);
  // });
  // // wsApi.attachPermissions([
  // //   rules.map(
  // //     (rule) =>
  // //       new iam.PolicyStatement({
  // //         actions: ['lambda:InvokeFunction'],
  // //         principal: 'events.amazonaws.com',
  // //         effect: 'allow',
  // //         resources: [rule],
  // //       }),
  // //   ),
  // // ]);

  const assets = new Bucket(stack, `${appName}-app-assets`, {
    defaults: {
      function: {
        timeout: defaultFunctionTimeout,
        environment: { tableName: table.tableName },
        permissions: [table],
      },
    },
    // notifications: {
    //   myNotification1: {
    //     function: 'src/notification1.main',
    //     events: ['object_created'],
    //   },
    //   myNotification2: {
    //     function: 'src/notification2.main',
    //     events: ['object_removed'],
    //   },
    // },
  });

  const apiRoutes: Record<string, ApiRouteProps<string>> = {
    ...testRoutes,
    'GET /session': 'packages/functions/app/api/src/session.handler',
    'OPTIONS /session': 'packages/functions/app/api/src/sessionOptions.handler',
    'POST /nodes/process-interaction':
      'packages/functions/app/api/src/nodes/processInteraction.handler',
    // 'POST /ddb-stream/process-batch': {
    //   function: {
    //     handler:
    //       'packages/functions/app/api/src/ddb-stream/processBatch.handler',
    //     timeout: app.local ? 100 : 10,
    //     // bind: [table, REGION, OAUTH_GOOGLE_KEY, STRIPE_KEY],
    //     permissions: [table, assets, REGION, 'events:PutEvents'],
    //   },
    // },
  };

  const api = new Api(stack, 'appApi', {
    customDomain: {
      domainName:
        stack.stage === 'prod'
          ? `api.${domain.toLowerCase()}`
          : `${stack.stage.toLowerCase()}.api.${domain.toLowerCase()}`,
      hostedZone: 'ekrata.com',
    },
    cors: {
      allowCredentials: true,
      allowHeaders: [
        'Authorization',
        'Origin',
        'Access-Control-Allow-Origin',
        'Content-Type',
        'Accept',
      ],
      exposeHeaders: [
        'Authorization',
        'Origin',
        'Access-Control-Allow-Origin',
        'Content-Type',
        'Accept',
      ],
      allowMethods: ['ANY'],

      allowOrigins: getAllowedOrigins(stack.stage, domain),
    },

    defaults: {
      throttle: {
        rate: 2000,
        burst: 100,
      },
      function: {
        timeout: defaultFunctionTimeout,
        bind: [
          table,
          assets,
          REGION,
          STAGE,
          BEDROCK_AWS_REGION,
          OPENAI_API_KEY,
          oauthGoogleClientId,
          oauthGoogleSecret,
          metaAppSecret,
          metaVerifySecret,
          stripeKeySecret,
          frontendUrl,
          allowedOrigins,
        ],
        // bind: [table, REGION, OAUTH_GOOGLE_KEY, STRIPE_KEY],
        permissions: [
          table,
          'sqs:ReceiveMessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
    routes: apiRoutes,
  });
  api.bind([api]);

  const processInteractionRoute = api.routes.find(
    (route) => route === 'POST /nodes/process-interaction',
  );
  const processInteractionFunction = api.getFunction(
    processInteractionRoute ?? '',
  );

  processInteractionFunction;

  if (!processInteractionFunction) {
    throw new Error('Could not find process interaction function');
  }

  // console.log(processInteractionFunction);
  // const botRules = {
  //   [`${processInteractionFunction?.id.replaceAll('/', '.')}-rule`]: {
  //     pattern: {
  //       source: ['ddbStream'],
  //       detailType: [ApiAppDetailType.apiAppCreateInteraction],
  //     },
  //     targets: {
  //       api: {
  //         cdk: {
  //           function: lambda.Function.fromFunctionArn(
  //             stack,
  //             processInteractionFunction.id,
  //             processInteractionFunction.functionArn,
  //           ),
  //         },
  //       },
  //     },
  //   },
  // } as Record<string, EventBusRuleProps>;

  // appEventBus.addRules(stack, { ...botRules });
  // const processInteractionRule = appEventBus.getRule(
  //   `${processInteractionFunction?.id.replaceAll('/', '.')}-rule`,
  // );
  // processInteractionFunction?.addPermission(`eb-invoke`, {
  //   action: 'lambda:InvokeFunction',
  //   principal: new iam.ServicePrincipal('events.amazonaws.com'),
  //   sourceArn: processInteractionRule?.ruleArn,
  // });

  const defaultQueueConfig:
    | {
        id?: string | undefined;
        queue?: IQueue | QueueProps | undefined;
      }
    | undefined = {
    queue: {
      // queueName: "my-queue",
      // visibilityTimeout: 10 Duration.seconds(defaultFunctionTimeout * 60),
      visibilityTimeout: Duration.seconds(10),
      receiveMessageWaitTime: Duration.seconds(1),
    },
  };

  const ddbStreamWsTopicSubs:
    | Record<
        string,
        | FunctionInlineDefinition
        | Queue
        | TopicFunctionSubscriberProps
        | TopicQueueSubscriberProps
      >
    | undefined = wsApi.routes.reduce((acc, route) => {
    const wsFunc = wsApi.getFunction(route);
    if (wsFunc && !wsFunc.id.includes('$')) {
      console.log(wsFunc?.id);
      return {
        ...acc,
        [`${wsFunc.id}`]: {
          type: 'queue',
          queue: new Queue(stack, `${route}_queue`, {
            cdk: defaultQueueConfig,
            consumer: {
              cdk: {
                function: lambda.Function.fromFunctionArn(
                  stack,
                  wsFunc.id,
                  wsFunc.functionArn,
                ),
              },
            },
          }),
          cdk: {
            subscription: {
              filterPolicy: {
                type: SubscriptionFilter.stringFilter({
                  allowlist: [wsFunc.id],
                }),
              },
            },
          },
        },
      };
    }
    return acc;
  }, {});

  const ddbStreamApiTopicSubs: () =>
    | Record<
        string,
        | FunctionInlineDefinition
        | Queue
        | TopicFunctionSubscriberProps
        | TopicQueueSubscriberProps
      >
    | undefined = () => {
    const func = processInteractionFunction;
    func.attachPermissions([table, 'sns']);
    if (func) {
      return {
        [`${func.id.replaceAll('/', '_')}-sub`]: {
          type: 'queue',
          queue: new Queue(stack, `${func.id.replaceAll('/', '_')}_queue`, {
            cdk: defaultQueueConfig,
            consumer: {
              cdk: {
                function: lambda.Function.fromFunctionArn(
                  stack,
                  func.id,
                  func.functionArn,
                ),
              },
            },
          }),
          cdk: {
            subscription: {
              filterPolicy: {
                type: SubscriptionFilter.stringFilter({
                  allowlist: [ApiAppDetailType.apiAppCreateInteraction],
                }),
              },
            },
          },
        },
      };
    }
    throw new Error('Failed to get a function from the ws api');
  };

  ddbStreamTopic.bind([
    table,
    REGION,
    // oauthGoogleClientId,
    // oauthGoogleSecret,
    // metaAppSecret,
    // metaVerifySecret,
    // stripeKeySecret,
    frontendUrl,
    allowedOrigins,
    assets,
  ]);
  ddbStreamTopic.attachPermissions([table]);
  ddbStreamTopic.addSubscribers(stack, {
    ...ddbStreamWsTopicSubs,
    ...ddbStreamApiTopicSubs(),
  });

  const botNodeTopicSubs:
    | Record<
        string,
        | FunctionInlineDefinition
        | Queue
        | TopicFunctionSubscriberProps
        | TopicQueueSubscriberProps
      >
    | undefined = {
    [botNodeEvent.AskAQuestion]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_AskAQuestion_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            handler:
              'packages/functions/app/api/src/nodes/inputActions/askAQuestion.handler',
            bind: [wsApi, api, REGION, table],
            permissions: [
              table,
              'sqs:ReceiveMessage',
              'sqs:DeleteMessage',
              'sqs:GetQueueAttributes',
            ],
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.AskAQuestion],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.DecisionCardMessages]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_DecisionCardMessages_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table],
            handler:
              'packages/functions/app/api/src/nodes/inputActions/decisionCardMessages.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.DecisionCardMessages],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.SubscribeForMailing]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_SubscribeForMailing_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table, botNodeTopic],
            handler:
              'packages/functions/app/api/src/nodes/actions/subscribeForMailing.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.SubscribeForMailing],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.SendAChatMessage]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_SendAChatMessage_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table, botNodeTopic],
            handler:
              'packages/functions/app/api/src/nodes/actions/sendAChatMessage.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.SendAChatMessage],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.TransferToOperator]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_TransferToOperator_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table, botNodeTopic],
            handler:
              'packages/functions/app/api/src/nodes/actions/transferToOperator.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.TransferToOperator],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.DecisionButtons]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_DecisionButtons_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table],
            handler:
              'packages/functions/app/api/src/nodes/inputActions/decisionButtons.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.DecisionButtons],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.DecisionQuickReplies]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_DecisionQuickReplies_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table],
            handler:
              'packages/functions/app/api/src/nodes/inputActions/decisionQuickReplies.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.DecisionQuickReplies],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.SalesBotAgent]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_chatbots_salesBot_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            ...faissLambdaConfig,
            memorySize: `1 GB`,
            handler:
              'packages/functions/app/api/src/nodes/agents/sales/sales.handler',
            bind: [wsApi, api, assets, REGION, table, OPENAI_API_KEY],
            permissions: [
              table,
              'sqs:ReceiveMessage',
              'sqs:DeleteMessage',
              'sqs:GetQueueAttributes',
            ],
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.SalesBotAgent],
              }),
            ),
          },
        },
      },
    },
    [botNodeEvent.CouponCode]: {
      type: 'queue',
      queue: new Queue(stack, `bot_node_action_CouponCode_queue`, {
        cdk: defaultQueueConfig,
        consumer: {
          function: {
            timeout: defaultFunctionTimeout,
            bind: [wsApi, api, REGION, table, botNodeTopic],
            handler:
              'packages/functions/app/api/src/nodes/actions/couponCode.handler',
          },
        },
      }),
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: FilterOrPolicy.filter(
              SubscriptionFilter.stringFilter({
                allowlist: [botNodeEvent.CouponCode],
              }),
            ),
          },
        },
      },
    },
  };

  botNodeTopic.bind([wsApi, api, REGION, table]);
  botNodeTopic.attachPermissions([
    table,
    'sqs:ReceiveMessage',
    'sqs:DeleteMessage',
    'sqs:GetQueueAttributes',
  ]);
  botNodeTopic.addSubscribers(stack, botNodeTopicSubs);
  // defaults: {
  //   function: {
  //     bind: [wsApi, api, REGION, table],
  //   }

  // }

  processInteractionFunction.bind([
    wsApi,
    api,
    REGION,
    table,
    botNodeTopic,
    ddbStreamTopic,
  ]);
  appEventBus.bind([wsApi, api, REGION, table]);

  // meta webhook handler -> SNS -> SQS -> lambdas
  // const metaMessengerTopic = new Topic(stack, 'MetaMessengerTopic', {
  //   subscribers: {
  //     [MessengerEvent.Messages]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.Messages}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messages.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.Messages],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessageDeliveries]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessageDeliveries}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messageDeliveries.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessageDeliveries],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessageEchoes]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessageEchoes}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messageEchos.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessageEchoes],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessageReactions]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessageReactions}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messageReactions.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessageReactions],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessageReads]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessageReads}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messageReads.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessageReads],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessagingFeedback]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessagingFeedback}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messagingFeedback.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessagingFeedback],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessagingOptins]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessagingOptins}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messagingOptins.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessagingOptins],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //     [MessengerEvent.MessagingSeen]: {
  //       type: 'queue',
  //       queue: new Queue(
  //         stack,
  //         `meta_messenger_${MessengerEvent.MessagingSeen}_queue`,
  //         {
  //           consumer:
  //             'packages/functions/app/api/src/webhooks/meta/messenger/messagingSeen.handler',
  //         },
  //       ),
  //       cdk: {
  //         subscription: {
  //           filterPolicy: {
  //             type: SubscriptionFilter.stringFilter({
  //               allowlist: [MessengerEvent.MessagingSeen],
  //             }),
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  const auth = new Auth(stack, 'auth', {
    authenticator: {
      handler: 'packages/functions/app/api/src/auth.handler',
    },
  });

  auth.attach(stack, {
    api,
    prefix: '/auth',
  });

  // // Create the WebSocket API
  // const api = new Api(stack, "app", {
  //   defaults: {
  //     function: {
  //       bind: [table],
  //     },
  //   },
  //   routes: {

  //   },
  // });

  process.env.NEXT_PUBLIC_APP_API_URL = api.customDomainUrl;
  process.env.NEXT_PUBLIC_WS_API_URL = wsApi.customDomainUrl;
  process.env.VITEST_REGION = REGION.value ?? '';
  process.env.VITEST_TABLE = tableName.value ?? '';

  const widgetHost = `widget-${domain}`;
  const widgetDomain =
    stack.stage === 'prod'
      ? widgetHost.toLowerCase()
      : `${stack.stage}.${widgetHost}`.toLowerCase();

  const siteDomainName =
    stack.stage === 'prod'
      ? domain.toLowerCase()
      : `${stack.stage}.${domain}`.toLowerCase();
  console.log('building: ', widgetDomain);
  const widget = new NextjsSite(stack, 'widget', {
    path: 'widget/',
    buildCommand: `echo 'building: ${widgetDomain}' && pnpm build`,
    // buildCommand: 'cd widget && pnpm build',
    customDomain: {
      domainName: widgetDomain,
      domainAlias: `www.${widgetDomain}`,
      hostedZone: 'ekrata.com',
    },
    bind: [api, wsApi],
    environment: {
      NEXT_PUBLIC_APP_API_URL: api.customDomainUrl ?? '',
      NEXT_PUBLIC_APP_WS_URL: wsApi.customDomainUrl ?? '',
      NEXT_PUBLIC_APP_URL:
        stack.stage === 'local'
          ? 'http://localhost:3000'
          : `https://${siteDomainName ?? ''}`,
    },
  });

  // console.log(
  //   widget.url,
  //   widget.customDomainUrl,
  //   widget.getConstructMetadata(),
  // );

  process.env.NEXT_PUBLIC_APP_WIDGET_URL = widget.customDomainUrl ?? '';

  // console.log('building: ', siteDomainName);
  const site = new NextjsSite(stack, 'dash', {
    // buildCommand: 'pnpm build',
    customDomain: {
      domainName: siteDomainName,
      domainAlias: `www.${siteDomainName}`,

      hostedZone: 'ekrata.com',
    },
    bind: [api, wsApi],
    environment: {
      NEXT_PUBLIC_APP_API_URL: api.customDomainUrl ?? '',
      NEXT_PUBLIC_APP_WS_URL: wsApi.customDomainUrl ?? '',
      NEXT_PUBLIC_APP_WIDGET_URL:
        stack.stage === 'local'
          ? 'http://localhost:3001'
          : `https://${widgetDomain ?? ''}/`,
    },
  });

  // console.log(widgetDomainName);
  // const widgetDomain = new codeartifact.CfnDomain(stack, 'chatWidgetDomain', {
  //   domainName: 'widget-echat-ekrata',
  // });

  // // Create a public repository
  // const publicWidgetRepo = new codeartifact.CfnRepository(
  //   stack,
  //   'publicChatWidgetRepo',
  //   {
  //     repositoryName: 'publicChatWidgetRepoStore',
  //     externalConnections: ['public:npmjs'],
  //     domainName: widgetDomain.domainName,
  //   },
  // );

  // publicWidgetRepo.addDependency(widgetDomain);

  // // Create a custom repository
  // const widgetCustomRepo = new codeartifact.CfnRepository(
  //   stack,
  //   'chatWidgetRepo',
  //   {
  //     repositoryName: 'chatWidgetRepoStore',
  //     upstreams: [publicWidgetRepo.repositoryName],
  //     domainName: widgetDomain.domainName,
  //   },
  // );

  // widgetCustomRepo.addDependency(publicWidgetRepo);

  console.log('Site url', site.customDomainUrl);
  console.log('widget url', widget.customDomainUrl);
  console.log('WsApi url', wsApi.customDomainUrl);
  console.log('api url', api.customDomainUrl);

  stack.addOutputs({
    SiteUrl: site.customDomainUrl,
    widgetUrl: widget.customDomainUrl,
    AppWsUrl: wsApi.customDomainUrl,
    AppApiUrl: api.customDomainUrl,
  });
  return {
    api,
    wsApi,
    assets,
  };
}
