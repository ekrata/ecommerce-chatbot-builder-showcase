import {
  Api,
  ApiRouteProps,
  Auth,
  NextjsSite,
  StackContext,
  Table,
  WebSocketApi,
} from 'sst/constructs';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';

export function AppStack({ stack, app }: StackContext) {
  // const APP_API_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'https://rwys6ma2k3.execute-api.us-east-1.amazonaws.com',
  // });

  // const APP_WS_URL = new Config.Parameter(stack, 'APP_API_URL', {
  //   value: 'wss://etr95nhzwk.execute-api.us-east-1.amazonaws.com/local',
  // });
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
    },
    primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
    globalIndexes: {
      'gsi1pk-gsi1sk-index': {
        partitionKey: 'gsi1pk',
        sortKey: 'gsi1sk',
        projection: 'all',
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
  const wsApi = new WebSocketApi(stack, 'ws', {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      $connect: 'packages/functions/app/ws/src/connect.main',
      $disconnect: 'packages/functions/app/ws/src/disconnect.main',
      sendmessage: 'packages/functions/app/ws/src/sendMessage.main',
    },
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

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        timeout: app.local ? 100 : 10,
        bind: [table],
        permissions: [table],
      },
    },
    routes: {
      'GET /orgs/{orgId}/conversations':
        'packages/functions/app/api/src/conversations/list.handler',
      'GET /orgs/{orgId}/conversations/{conversationId}':
        'packages/functions/app/api/src/conversations/get.handler',
      'DELETE /orgs/{orgId}/conversations/{conversationId}':
        'packages/functions/app/api/src/conversations/delete.handler',
      'POST /orgs/{orgId}/conversations/{conversationId}':
        'packages/functions/app/api/src/conversations/create.handler',
      'PATCH /orgs/{orgId}/conversations/{conversationId}':
        'packages/functions/app/api/src/conversations/update.handler',

      'GET /orgs/{orgId}/conversations/{conversationId}/messages':
        'packages/functions/app/api/src/conversations/messages/list.handler',
      'GET /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
        'packages/functions/app/api/src/conversations/messages/get.handler',
      'DELETE /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
        'packages/functions/app/api/src/conversations/messages/delete.handler',
      'POST /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
        'packages/functions/app/api/src/conversations/messages/create.handler',
      // 'PATCH /orgs/{orgId}/conversations/{conversationId}/messages/{messageId}':
      //   'packages/functions/app/api/src/conversations/messages/update.handler',

      'GET /orgs': 'packages/functions/app/api/src/orgs/list.handler',
      'GET /orgs/{orgId}': 'packages/functions/app/api/src/orgs/get.handler',
      'DELETE /orgs/{orgId}':
        'packages/functions/app/api/src/orgs/delete.handler',
      'POST /orgs/{orgId}':
        'packages/functions/app/api/src/orgs/create.handler',
      'PATCH /orgs/{orgId}':
        'packages/functions/app/api/src/orgs/update.handler',

      'GET /orgs/{orgId}/operators':
        'packages/functions/app/api/src/operators/list.handler',
      'GET /orgs/{orgId}/operators/{operatorId}':
        'packages/functions/app/api/src/operators/get.handler',
      'DELETE /orgs/{orgId}/operators/{operatorId}':
        'packages/functions/app/api/src/operators/delete.handler',
      'POST /orgs/{orgId}/operators/{operatorId}':
        'packages/functions/app/api/src/operators/create.handler',
      'PATCH /orgs/{orgId}/operators/{operatorId}':
        'packages/functions/app/api/src/operators/update.handler',

      'GET /orgs/{orgId}/customers':
        'packages/functions/app/api/src/customers/list.handler',
      'GET /orgs/{orgId}/customers/{customerId}':
        'packages/functions/app/api/src/customers/get.handler',
      'DELETE /orgs/{orgId}/customers/{customerId}':
        'packages/functions/app/api/src/customers/delete.handler',
      'POST /orgs/{orgId}/customers/{customerId}':
        'packages/functions/app/api/src/customers/create.handler',
      'PATCH /orgs/{orgId}/customers/{customerId}':
        'packages/functions/app/api/src/customers/update.handler',

      'GET /orgs/{orgId}/settings':
        'packages/functions/app/api/src/customers/get.handler',
      'PATCH /orgs/{orgId}/settings':
        'packages/functions/app/api/src/customers/update.handler',
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

  const site = new NextjsSite(stack, 'site', {
    customDomain: {
      domainName: stack.stage === 'prod' ? domain : `${stack.stage}-${domain}`,
    },
    bind: [api, wsApi],
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
