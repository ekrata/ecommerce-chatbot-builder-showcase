import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent, BotNodeType } from '@/entities/bot';
import { OutputFieldsKeys } from '@/src/app/[locale]/dash/(root)/bots/outputFields';

import { BotStateContext } from './botStateContext';
import { getNextNodes } from './getNextNodes';

const sns = new AWS.SNS();

export const publishToNextNodes = (botStateContext: BotStateContext) => {
  const { currentNode, bot, messages } = botStateContext;
  if (currentNode?.id && bot?.nodes && bot?.edges) {
    const outputFieldKey =
      OutputFieldsKeys[botStateContext?.type as keyof typeof OutputFieldsKeys];

    let nextNodes: BotNodeType[] = [];
    if (!outputFieldKey || outputFieldKey === 'outputs') {
      nextNodes = getNextNodes(currentNode.id, bot?.nodes, bot?.edges);
    } else if (outputFieldKey) {
      nextNodes = getNextNodes(
        currentNode.id,
        bot?.nodes,
        bot?.edges,
        messages?.slice(-1)[0].selectedEdgeLabel,
      );
    }
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
                type: nextNodeType,
                currentNode: nextNode,
                nextNode: {},
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
};
