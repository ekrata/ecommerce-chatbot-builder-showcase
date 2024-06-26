import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Config, EventBus, StackContext, Topic } from 'sst/constructs';

export const getAllowedOrigins = (stage: string, domain: string) => {
  if (stage === 'local') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      `https://${stage}.${domain}`,
    ];
  } else if (stage === 'prod') {
    return [`https://${domain}`];
  } else {
    return [`https://${stage}.${domain}`];
  }
};
export function paramStack({ stack, app }: StackContext) {
  const IS_LOCAL = new Config.Parameter(stack, 'IS_LOCAL', {
    value: JSON.stringify(app.local),
  });
  const appName = 'echat';

  const domain = `${appName}.ekrata.com`;

  const REGION = new Config.Parameter(stack, 'REGION', {
    value: app.region,
  });

  const BEDROCK_AWS_REGION = new Config.Parameter(stack, 'BEDROCK_AWS_REGION', {
    value: 'us-east-1',
  });

  const STAGE = new Config.Parameter(stack, 'STAGE', {
    value: app.stage,
  });

  const defaultFunctionTimeout = new Config.Parameter(
    stack,
    'DEFAULT_FUNCTION_TIMEOUT',
    {
      value: '10',
    },
  );

  const getFrontendUrl = () => {
    return getAllowedOrigins(stack.stage, domain)?.[0];
  };

  const frontendUrl = new Config.Parameter(stack, 'FRONTEND_URL', {
    value: getFrontendUrl(),
  });

  const tableName = new Config.Parameter(stack, 'tableName', {
    value: `${stack.stage}-${appName}-app`,
  });

  const allowedOrigins = new Config.Parameter(stack, 'ALLOWED_ORIGINS', {
    value: getAllowedOrigins(stack.stage, domain)[0],
  });

  console.log('Frontend value: ', frontendUrl.value?.[0]);

  const oauthGoogleClientId = new Config.Parameter(
    stack,
    'OAUTH_GOOGLE_CLIENT_ID',
    {
      value: `11916374620-iveeirp449he0iocir9j15v4be5c1rjt.apps.googleusercontent.com`,
    },
  );

  const oauthGoogleSecret = new Config.Secret(stack, 'OAUTH_GOOGLE_SECRET');
  const stripeKeySecret = new Config.Secret(stack, 'STRIPE_KEY_SECRET');
  const metaAppSecret = new Config.Secret(stack, 'META_APP_SECRET');
  const metaVerifySecret = new Config.Secret(stack, 'META_VERIFY_SECRET');
  const OPENAI_API_KEY = new Config.Secret(stack, 'OPENAI_API_KEY');

  const appEventBus = new EventBus(stack, 'appEventBus', {});
  // for dynamodb streams
  const ddbStreamTopic = new Topic(stack, 'DdbStreamTopic', {});

  // for bot actions
  const botNodeTopic = new Topic(stack, 'BotNodeTopic', {
    defaults: {
      function: {
        permissions: [
          'sqs:ReceiveMessage',
          'sqs:Sendmessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
  });
  // for meta webhooks
  const metaMessengerTopic = new Topic(stack, 'MetaMessengerTopic', {
    defaults: {
      function: {
        permissions: [
          'sqs:ReceiveMessage',
          'sqs:Sendmessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
  });

  // for meta webhooks
  const metaWhatsappTopic = new Topic(stack, 'MetaWhatsappTopic', {
    defaults: {
      function: {
        permissions: [
          'sqs:ReceiveMessage',
          'sqs:Sendmessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
  });

  const metaInstagramTopic = new Topic(stack, 'MetaInstagramTopic', {
    defaults: {
      function: {
        permissions: [
          'sqs:ReceiveMessage',
          'sqs:Sendmessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
      },
    },
  });

  const faissLambdaConfig = {
    timeout: 30,
    nodejs: {
      install: ['faiss-node'],
    },
    layers: [
      new lambda.LayerVersion(stack, 'faiss-node', {
        code: lambda.Code.fromAsset('layers/faiss-node'),
      }),
    ],
    permissions: ['bedrock:InvokeModel'],
    bind: [BEDROCK_AWS_REGION, OPENAI_API_KEY],
  };

  return {
    appName,
    domain,
    appEventBus,
    ddbStreamTopic,
    botNodeTopic,
    metaMessengerTopic,
    metaWhatsappTopic,
    metaInstagramTopic,
    REGION,
    faissLambdaConfig,
    STAGE,
    tableName,
    frontendUrl,
    allowedOrigins,
    BEDROCK_AWS_REGION,
    oauthGoogleClientId,
    oauthGoogleSecret,
    OPENAI_API_KEY,
    stripeKeySecret,
    defaultFunctionTimeout,
    metaAppSecret,
    metaVerifySecret,
  };
}
