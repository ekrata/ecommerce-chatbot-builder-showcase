import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent } from '@/entities/bot';

import { BotStateContext, getNextNodes } from './processInteraction';

const sns = new AWS.SNS();

export const publishToNextNodes = (botStateContext: BotStateContext) => {
  const { currentNode, bot } = botStateContext;
  if (currentNode?.id && bot?.nodes && bot?.edges) {
    const nextNodes = getNextNodes(currentNode.id, bot?.nodes, bot?.edges);
    nextNodes?.map(async (nextNode) => {
      if (nextNode?.type) {
        const nextNodeType = Object.entries(botNodeEvent).find(
          ([key, value]) => {
            if (value === nextNode.type) {
              return botNodeEvent?.[key as keyof typeof botNodeEvent];
            }
          },
        ) as BotNodeEvent | undefined;
        if (nextNodeType) {
          console.log(nextNodeType);
          await sns
            .publish({
              TopicArn: Topic?.BotNodeTopic?.topicArn,
              Message: JSON.stringify({
                ...botStateContext,
              }),
              MessageAttributes: {
                type: {
                  DataType: 'String',
                  StringValue: nextNodeType,
                },
              },
              MessageStructure: 'string',
            })
            .promise();
        }
      }
    });
  }
  return botStateContext;
};
