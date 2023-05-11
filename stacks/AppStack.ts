import {
  Api,
  Auth,
  Config,
  NextjsSite,
  Script,
  StackContext,
  Table,
  WebSocketApi,
} from 'sst/constructs';
import { Service } from 'electrodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Conversation } from './entities/conversation';
import { Customer } from './entities/customer';
import { Message } from './entities/message';
import { Org } from './entities/org';
import { Operator } from './entities/operator';

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

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      'GET /conversations':
        'packages/functions/app/api/src/conversations/list.handler',
      'POST /conversations':
        'packages/functions/app/api/src/conversations/create.handler',
      'GET /conversations/{id}':
        'packages/functions/app/api/src/conversations/get.handler',
      'DELETE /conversations/{id}':
        'packages/functions/app/api/src/conversations/delete.handler',
      'PUT /conversations/{id}':
        'packages/functions/app/api/src/conversations/update.handler',
      'POST /util/seed': 'packages/functions/app/api/src/util/seed.handler',
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
