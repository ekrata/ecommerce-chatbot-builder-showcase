import AWS from 'aws-sdk';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent, BotNodeType } from '@/entities/bot';
import { OutputFieldsKeys } from '@/src/app/[locale]/dash/(root)/bots/outputFields';

import { Agent } from '../bots/triggers/definitions.type';
import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';
import { findNextNodes, getNextNodes } from './getNextNodes';

const sns = new AWS.SNS();

export const publishToNextNodes = async (
  botStateContext: BotStateContext,
  appDb: ReturnType<typeof getAppDb>,
) => {
  try {
    const { customerId, orgId } = botStateContext?.conversation;
    // if agent, we do not pass to next node. we repeat the current node until bot requests to transfer to human

    // console.log('currNode', botStateContext?.currentNode);
    if (
      botStateContext?.currentNode?.type &&
      Object.values(Agent).includes(botStateContext?.currentNode?.type as Agent)
    ) {
      console.log('pub agent');
      // console.log(botStateContext);
      // console.log(botStateContext.currentNode.type);
      await sns
        .publish({
          TopicArn: Topic?.BotNodeTopic?.topicArn,
          Message: JSON.stringify({
            ...botStateContext,
          }),
          MessageAttributes: {
            type: {
              DataType: 'String',
              StringValue: botStateContext?.currentNode?.type,
            },
          },
        })
        .promise();
      return [botStateContext.currentNode];
    } else {
      const nextNodes = findNextNodes(botStateContext);
      console.log(nextNodes);
      // stop bot
      if (!nextNodes?.length && customerId) {
        console.log('no more nodes');
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
                  })
                  .promise();
              }
            }
          }),
        );
        return nextNodes;
      }
    }
  } catch (err) {
    console.log(err);
  }
};
