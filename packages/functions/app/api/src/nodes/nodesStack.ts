import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Cron, StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';
import { dbStack } from 'stacks/dbStack';
import { paramStack } from 'stacks/paramStack';

// import { readFile } from '~/.aws/credentials';

export function nodesStack({ stack, app }: StackContext) {
  const {
    BEDROCK_AWS_REGION,
    OPENAI_API_KEY,
    botNodeTopic,
    faissLambdaConfig,
  } = use(paramStack);
  const { api, assets } = use(baseStack);
  const { table } = use(dbStack);

  new Cron(stack, 'createArticleVectorStoreChron', {
    schedule: 'rate(12 hours)',
    job: {
      function: {
        ...faissLambdaConfig,
        handler:
          'packages/functions/app/api/src/nodes/agents/createArticleVectorStore.handler',
        bind: [table, assets, ...faissLambdaConfig.bind],
        permissions: [table, assets, ...faissLambdaConfig.permissions],
      },
    },
  });

  api.addRoutes(stack, {
    'POST /nodes/create-article-vector-store': {
      function: {
        ...faissLambdaConfig,
        handler:
          'packages/functions/app/api/src/nodes/agents/createArticleVectorStore.handler',
        bind: [table, assets, ...faissLambdaConfig.bind],
        permissions: [table, assets, ...faissLambdaConfig.permissions],
      },
    },
    'POST /orgs/{orgId}/nodes/chatbots/chat/test': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/chat/index.testHandler',
        ...faissLambdaConfig,
      },
    },
    'POST /orgs/{orgId}/nodes/chatbots/chat/run': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/sales/index.testHandler',
        ...faissLambdaConfig,
      },
    },
    'POST /orgs/{orgId}/nodes/chatbots/sales': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/sales/index.handler',
        ...faissLambdaConfig,
      },
    },
    'POST /orgs/{orgId}/nodes/chatbots/sales-test': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/sales/index.testHandler',
        ...faissLambdaConfig,
      },
    },
  });
}
