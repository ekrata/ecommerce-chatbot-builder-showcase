import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';
import { v5 as uuidv5 } from 'uuid';

import { BotEdgeType, BotNodeEvent, botNodeEvent, BotNodeType } from '@/entities/bot';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';

const sns = new AWS.SNS();

export const handler = Sentry.AWSLambda.wrapHandler(
  async () => {
    const botStateContext: BotStateContext = useJsonBody()
    return handleFailure(botStateContext)
  }
);

const handleFailure = (botStateContext: BotStateContext) => {
  try {
    if (
      botStateContext?.nextNode?.id &&
      botStateContext?.bot?.nodes &&
      botStateContext?.bot?.edges
    ) {
      // console.log(botStateContext);
      const nextNodes = getFailureNode(
        botStateContext?.currentNode?.id ?? '',
        botStateContext?.bot?.nodes,
        botStateContext?.bot?.edges,
      );
      console.log(nextNodes);
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
            console.log(nextNode);
            await sns
              .publish({
                TopicArn: Topic?.BotNodeTopic?.topicArn,
                Message: JSON.stringify({
                  ...botStateContext,
                  type: nextNodeType?.[1],
                  nextNode: {},
                  currentNode: nextNode,
                } as BotStateContext),
                MessageAttributes: {
                  type: {
                    DataType: 'String',
                    StringValue: nextNodeType?.[1],
                  },
                },
                MessageStructure: 'string',
              })
              .promise();
          }
        }
      });
    }

  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}



const getFailureNode = (ancestorNodeId: string, nodes?: BotNodeType[], edges?: BotEdgeType[],) => {
  const nodeIds = edges
    ?.filter((edge) => (edge.target === ancestorNodeId && JSON.parse(edge?.data ?? '{}')?.label?.includes('Failure')))
    .map(({ source }) => source);
  return nodes?.filter(({ id }) => nodeIds?.includes(id));
}