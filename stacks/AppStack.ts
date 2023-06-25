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
  StackContext,
  Table,
  WebSocketApi,
  WebSocketApiFunctionRouteProps,
} from 'sst/constructs';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { appRoutes } from './appRoutes';

export function AppStack({ stack, app }: StackContext) {
  // const APP_API_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'https://rwys6ma2k3.execute-api.us-east-1.amazonaws.com',
  // });

  // const APP_WS_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'wss://etr95nhzwk.execute-api.us-east-1.amazonaws.com/local',
  // });

  const IS_LOCAL = new Config.Parameter(stack, 'IS_LOCAL', {
    value: JSON.stringify(app.local),
  });

  const REGION = new Config.Parameter(stack, 'REGION', {
    value: app.region,
  });

  if (app.stage !== 'prod') {
    app.setDefaultRemovalPolicy('destroy');
  }

  if (!app.local) {
    const sentry = LayerVersion.fromLayerVersionArn(
      stack,
      'SentryLayer',
      `arn:aws:lambda:${app.region}:943013980633:layer:SentryNodeServerlessSDK:132`
    );
    stack.addDefaultFunctionLayers([sentry]);
    stack.addDefaultFunctionEnv({
      SENTRY_DSN: process.env.SENTRY_DSN ?? '',
      SENTRY_TRACES_SAMPLE_RATE: '1.0',
      NODE_OPTIONS: '-r @sentry/serverless/dist/awslambda-auto',
    });
  }
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
    consumers: {
      consumer1: {
        function: {
          handler:
            'packages/functions/app/api/src/ddb-stream/processBatch.handler',
          timeout: 10,
          permissions: [],
        },
      },
    },
  });

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
  const domain = 'crow.ekrata.com';

  // Create the WebSocket API
  // All are batch operations

  const wsApiRoutes:
    | Record<string, FunctionInlineDefinition | WebSocketApiFunctionRouteProps>
    | undefined = {
    eventNewMessage:
      'packages/functions/app/ws/src/conversations/messages/eventNewMessage.handler',
    eventUpdateMessage:
      'packages/functions/app/ws/src/conversations/messages/sendUpdateMessage.handler',
    eventNewConversation:
      'packages/functions/app/ws/src/conversations/eventNewConversation.handler',
    eventUpdateConversation:
      'packages/functions/app/ws/src/conversations/eventUpdateConversation.handler',

    $connect: 'packages/functions/app/ws/src/connect.handler',
    $default: 'packages/functions/app/ws/src/connect.handler',
    $disconnect: 'packages/functions/app/ws/src/disconnect.handler',
  };

  const wsApi = new WebSocketApi(stack, 'appWs', {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: wsApiRoutes,
  });

  // Only need to be available locally, for seeding and dropping the test db
  const testRoutes: Record<string, ApiRouteProps<string>> = app.local
    ? {
        'POST /util/seed-test-db':
          'packages/functions/app/api/src/util/seed.handler',
        'POST /util/wipe-test-db':
          'packages/functions/app/api/src/util/wipe.handler',
      }
    : {};

  // Because the rules of the entire websocket API(Which is responsible for the real time messaging and notifications of the app))
  // are of the same, shared structure, we can simply build the eventbus rules dynamically from lambda names
  const rules: Record<string, EventBusRuleProps> = wsApi.routes.reduce(
    (acc, route) => {
      const wsFunc = wsApi.getFunction(route);
      if (wsFunc) {
        return {
          ...acc,
          [`${wsFunc.id.split('$').slice(-1)[0]}`]: {
            pattern: {
              source: ['ddbStream'],
              detailType: [wsFunc.id],
            },
            targets: {
              ws: {
                cdk: {
                  function: lambda.Function.fromFunctionArn(
                    stack,
                    wsFunc.id,
                    wsFunc.functionArn
                  ),
                },
              },
            },
          },
        } as Record<string, EventBusRuleProps>;
      }
      throw new Error('Failed to get a function from the ws api');
    },
    {}
  );

  new Bucket(stack, 'Bucket', {
    defaults: {
      function: {
        timeout: 20,
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

  const appEventBus = new EventBus(stack, 'appEventBus', {
    rules,
  });

  const api = new Api(stack, 'appApi', {
    defaults: {
      function: {
        timeout: app.local ? 100 : 10,
        bind: [table, REGION],
        permissions: [table],
      },
    },
    routes: {
      ...appRoutes,
      ...testRoutes,
    },
  });

  const auth = new Auth(stack, 'auth', {
    authenticator: {
      handler: 'packages/functions/api/src/auth.handler',
    },
  });

  auth.attach(stack, {
    api,
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

  process.env.NEXT_PUBLIC_APP_API_URL = api.url;

  const site = new NextjsSite(stack, 'site', {
    customDomain: {
      domainName: stack.stage === 'prod' ? domain : `${stack.stage}-${domain}`,
    },
    bind: [api, wsApi],
    environment: {
      NEXT_PUBLIC_APP_API_URL: api.url,
      NEXT_PUBLIC_APP_WS_URL: wsApi.url,
    },
  });

  // const auth = new Auth(stack, "auth", {
  //   authenticator: {
  //     handler: "packages/functions/src/auth.handler",
  //   },
  // });

  // auth.attach(stack, {
  //   api,
  //   prefix: "/auth", // optional
  // });
  // Show the API endpoint in the output
  stack.addOutputs({
    SiteUrl: site.url,
    AppWsUrl: wsApi.url,
    AppApiUrl: api.url,
  });
}
