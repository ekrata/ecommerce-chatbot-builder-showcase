import * as lambda from 'aws-cdk-lib/aws-lambda';
import { StackContext, use } from 'sst/constructs';
import { baseStack } from 'stacks/baseStack';
import { paramStack } from 'stacks/paramStack';

// import { readFile } from '~/.aws/credentials';

export function nodesStack({ stack, app }: StackContext) {
  const { BEDROCK_AWS_REGION } = use(paramStack);
  const { api } = use(baseStack);

  const getLambda = {
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
    bind: [BEDROCK_AWS_REGION],
  };

  api.addRoutes(stack, {
    // 'GET /orgs/{orgId}/bots':
    //   'packages/functions/app/api/src/bots/list.handler',
    // 'GET /orgs/{orgId}/bots/{botId}':
    //   'packages/functions/app/api/src/bots/get.handler',
    // 'POST /orgs/{orgId}/nodes/actions/ask-a-question':
    //   'packages/functions/app/api/src/nodes/actions/askAQuestion.handler',
    // 'POST /orgs/{orgId}/nodes/process-interaction':
    //   'packages/functions/app/api/src/nodes/processInteraction.handler',
    // 'DELETE /orgs/{orgId}/nodes/{botId}':
    //   'packages/functions/app/api/src/nodes/delete.handler',
    // 'POST /orgs/{orgId}/bots/{botId}': //   'packages/functions/app/api/src/nodes/create.handler',
    'POST /orgs/{orgId}/nodes/chatbots/sales': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/sales/index.handler',
        ...getLambda,
      },
    },
    'POST /orgs/{orgId}/nodes/chatbots/sales-test': {
      function: {
        handler:
          'packages/functions/app/api/src/nodes/chatbots/sales/index.testHandler',
        ...getLambda,
      },
    },
  });
}
