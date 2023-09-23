import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

export function BaseStack({ stack, app }: StackContext) {
  // const APP_API_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'https://rwys6ma2k3.execute-api.us-east-1.amazonaws.com',
  // });

  // const APP_WS_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'wss://etr95nhzwk.execute-api.us-east-1.amazonaws.com/local',
  // });

  const IS_LOCAL = new Config.Parameter(stack, 'IS_LOCAL', {
    value: JSON.stringify(app.local),
  });
  const appName = 'eChat';

  const domain = `${appName}.ekrata.com`;

  const REGION = new Config.Parameter(stack, 'REGION', {
    value: app.region,
  });

  const getFrontendUrl = () => {
    if (app.local) {
      return 'http://localhost:3000';
    }
    return stack.stage === 'prod' ? domain : `${stack.stage}-${domain}`;
  };

  const frontendUrl = new Config.Parameter(stack, 'FRONTEND_URL', {
    value: getFrontendUrl(),
  });

  const getAllowedOrigins = () => {
    if (app.local) {
      return 'http://localhost:3000';
    }
    return stack.stage === 'prod' ? domain : `${stack.stage}-${domain}`;
  };

  const allowedOrigins = new Config.Parameter(stack, 'ALLOWED_ORIGINS', {
    value: getAllowedOrigins(),
  });

  console.log('Frontend value: ', frontendUrl.value);

  const oauthGoogleClientId = new Config.Parameter(
    stack,
    'OAUTH_GOOGLE_CLIENT_ID',
    {
      value: `11916374620-iveeirp449he0iocir9j15v4be5c1rjt.apps.googleusercontent.com`,
    },
  );

  const oauthGoogleSecret = new Config.Secret(stack, 'OAUTH_GOOGLE_SECRET');

  const STRIPE_KEY = new Config.Secret(stack, 'STRIPE_KEY');

  if (app.stage !== 'prod') {
    app.setDefaultRemovalPolicy('destroy');
  }

  if (!app.local) {
    const sentry = lambda.LayerVersion.fromLayerVersionArn(
      stack,
      'SentryLayer',
      `arn:aws:lambda:${app.region}:943013980633:layer:SentryNodeServerlessSDK:132`,
    );
    stack.addDefaultFunctionLayers([sentry]);
    stack.addDefaultFunctionEnv({
      SENTRY_DSN: process.env.SENTRY_DSN ?? '',
      SENTRY_TRACES_SAMPLE_RATE: '1.0',
      NODE_OPTIONS: '-r @sentry/serverless/dist/awslambda-auto',
    });
  }

  const appEventBus = new EventBus(stack, 'appEventBus', {});

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
          timeout: 20,
          bind: [appEventBus],
          permissions: ['events:PutEvents'],
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

  // Create the WebSocket API
  // All are batch operations

  const wsApiRoutes:
    | Record<string, FunctionInlineDefinition | WebSocketApiFunctionRouteProps>
    | undefined = {
    createMessage:
      'packages/functions/app/ws/src/messages/createMessage.handler',

    createConversation:
      'packages/functions/app/ws/src/conversations/createConversation.handler',
    updateConversation:
      'packages/functions/app/ws/src/conversations/updateConversation.handler',

    createCustomer:
      'packages/functions/app/ws/src/customers/createCustomer.handler',
    updateCustomer:
      'packages/functions/app/ws/src/customers/updateCustomer.handler',

    createOperator:
      'packages/functions/app/ws/src/operators/createOperator.handler',
    updateOperator:
      'packages/functions/app/ws/src/operators/updateOperator.handler',

    $connect: 'packages/functions/app/ws/src/connect.handler',
    $default: 'packages/functions/app/ws/src/connect.handler',
    $disconnect: 'packages/functions/app/ws/src/disconnect.handler',
  };

  const wsApi = new WebSocketApi(stack, 'appWs', {
    defaults: {
      function: {
        bind: [table, REGION, appEventBus],
      },
    },
    routes: wsApiRoutes,
  });

  wsApi.bind([wsApi]);

  // Only need to be available locally, for seeding and dropping the test db
  const testRoutes: Record<string, ApiRouteProps<string>> = app.local
    ? {
        'POST /util/seed-test-db':
          'packages/functions/app/api/src/util/seed.handler',
        'POST /util/small-seed-test-db':
          'packages/functions/app/api/src/util/smallSeed.handler',
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
          [`${wsFunc.id.split('$').slice(-1)[0]}-rule`]: {
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
                    wsFunc.functionArn,
                  ),
                },
              },
            },
          },
        } as Record<string, EventBusRuleProps>;
      }
      throw new Error('Failed to get a function from the ws api');
    },
    {},
  );

  // add rules
  appEventBus.addRules(stack, rules);

  // add permissions to allow eventbridge rules to invoke respective wsApi lambda.
  wsApi.routes.map((route) => {
    const routeRuleKey = Object.keys(rules).find((rule) =>
      rule.includes(`${route.split('$').slice(-1)[0]}-rule`),
    );

    if (!routeRuleKey) {
      throw new Error('Failed to find a route rule key');
    }

    const routeRule = appEventBus.getRule(routeRuleKey);
    if (!routeRule) {
      throw new Error('Failed to find a route rule');
    }
    const fn = wsApi.getFunction(route);
    // fn?.addPermission(new iam.ServicePrincipal('events.amazonaws.com'));
    fn?.addPermission(`eb-invoke`, {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('events.amazonaws.com'),
      sourceArn: routeRule.ruleArn,
    });
    // wsApi.attachPermissionsToRoute(route, [
    //   new iam.PolicyStatement({
    //     actions: ['lambda:InvokeFunction'],
    //     effect: iam.Effect.ALLOW,
    //     principals: [new iam.ServicePrincipal('events.amazonaws.com')],
    //     resources: [routeRule.ruleArn],
    //   }),
    // ]);
  });
  // wsApi.attachPermissions([
  //   rules.map(
  //     (rule) =>
  //       new iam.PolicyStatement({
  //         actions: ['lambda:InvokeFunction'],
  //         principal: 'events.amazonaws.com',
  //         effect: 'allow',
  //         resources: [rule],
  //       }),
  //   ),
  // ]);

  const assets = new Bucket(stack, `${appName}-app-assets`, {
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

  const api = new Api(stack, 'appApi', {
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
      allowOrigins: [allowedOrigins.value],
    },
    defaults: {
      function: {
        timeout: app.local ? 100 : 10,
        bind: [
          table,
          assets,
          REGION,
          oauthGoogleClientId,
          oauthGoogleSecret,
          frontendUrl,
          allowedOrigins,
        ],
        // bind: [table, REGION, OAUTH_GOOGLE_KEY, STRIPE_KEY],
        permissions: [table],
      },
    },
    routes: {
      ...testRoutes,
      'GET /session': 'packages/functions/app/api/src/session.handler',
      'OPTIONS /session':
        'packages/functions/app/api/src/sessionOptions.handler',
      // 'POST /ddb-stream/process-batch': {
      //   function: {
      //     handler:
      //       'packages/functions/app/api/src/ddb-stream/processBatch.handler',
      //     timeout: app.local ? 100 : 10,
      //     // bind: [table, REGION, OAUTH_GOOGLE_KEY, STRIPE_KEY],
      //     permissions: [table, assets, REGION, 'events:PutEvents'],
      //   },
      // },
    },
  });

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

  process.env.NEXT_PUBLIC_APP_API_URL = api.url;
  process.env.NEXT_PUBLIC_WS_API_URL = wsApi.url;

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
  return {
    api,
  };
}
