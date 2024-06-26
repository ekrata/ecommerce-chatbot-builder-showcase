import AWS from 'aws-sdk';
import { Config } from 'sst/node/config';
import { Topic } from 'sst/node/topic';

import { BotNodeEvent, botNodeEvent, BotNodeType } from '@/entities/bot';
import { OutputFieldsKeys } from '@/src/app/[locale]/dash/(root)/bots/outputFields';

import { Agent } from '../bots/triggers/definitions.type';
import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';
import { findNextNodes, getNextNodes } from './getNextNodes';

export const publishToNextNodes = async (
  botStateContext: BotStateContext,
  appDb: ReturnType<typeof getAppDb>,
  sns: AWS.SNS = new AWS.SNS({ region: Config.REGION }),
) => {
  try {
    const { customerId, conversationId, orgId } = botStateContext?.conversation;
    // if agent, we do not pass to next node. we repeat the current node until bot requests to transfer to human

    // console.log('currNode', botStateContext?.currentNode);
    console.log('hiiii');
    if (
      botStateContext?.currentNode?.type &&
      Object.values(Agent).includes(botStateContext?.currentNode?.type as Agent)
    ) {
      console.log('pub agent');
      // console.log(botStateContext);
      console.log(new Blob([JSON.stringify(botStateContext)]).size);
      try {
        const res = await sns
          .publish({
            TopicArn: Topic?.BotNodeTopic?.topicArn,
            Message: JSON.stringify(botStateContext),
            MessageAttributes: {
              type: {
                DataType: 'String',
                StringValue: botStateContext?.currentNode?.type,
              },
            },
          })
          .promise();
        console.log(res);
      } catch (err) {
        console.log(err);
      }
      return [botStateContext.currentNode];
    } else {
      const messages = (
        await appDb.entities.messages.query
          .byConversation({
            conversationId: conversationId,
            orgId: orgId ?? '',
          })
          .go()
      )?.data;

      const nextNodes = findNextNodes(botStateContext, messages);
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
