import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent, BotNodeType } from '@/entities/bot';
import { OutputFieldsKeys } from '@/src/app/[locale]/dash/(root)/bots/outputFields';

import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';
import { findNextNodes, getNextNodes } from './getNextNodes';

const sns = new AWS.SNS();

export const publishToNextNodes = async (
  botStateContext: BotStateContext,
  appDb: ReturnType<typeof getAppDb>,
) => {
  const { customerId, orgId } = botStateContext?.conversation;
  const nextNodes = findNextNodes(botStateContext);
  console.log(nextNodes);
  if (!nextNodes?.length && customerId) {
    await appDb.entities.customers
      ?.update({ customerId, orgId })
      .set({ botId: '' })
      .go();
    return null;
  } else {
    await Promise.all(
      nextNodes.map(async (nextNode) => {
        console.log(nextNode);
        if (nextNode?.type) {
          const nextNodeType: BotNodeEvent | undefined = Object.entries(
            botNodeEvent,
          ).find(([key, value]) => {
            if (value === nextNode.type) {
              return botNodeEvent?.[key as keyof typeof botNodeEvent];
            }
          })?.[1];
          if (nextNodeType) {
            console.log('type', nextNodeType);
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
      }),
    );
    return nextNodes;
  }
};
