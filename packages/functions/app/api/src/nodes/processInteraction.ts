import AWS, { ApiGatewayManagementApi, AWSError, DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { postToConnection } from 'packages/functions/app/ws/src/postToConnection';
import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';
import { WebSocketApi } from 'sst/node/websocket-api';

import { Bot, BotEdgeType, BotNodeEvent, botNodeEvent, BotNodeType, nodeMap } from '@/entities/bot';
import { Conversation, ConversationItem } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Interaction } from '@/entities/interaction';
import * as Sentry from '@sentry/serverless';

import { Message } from '../../../../../../stacks/entities/message';
import { getAppDb } from '../../../api/src/db';
import { Triggers, VisitorBotInteractionTrigger } from '../bots/triggers/definitions.type';

const sns = new AWS.SNS();

export type BotStateContext = {
  type: BotNodeEvent;
  bot: EntityItem<typeof Bot>;
  conversation: ConversationItem;
  nextNode: BotNodeType;
  currentNode: BotNodeType;
  nodeContext: { currentId: string };
};

// console.log(
//   new Blob([
//     JSON.stringify({
//       messages: botState,
//     }),
//   ]).size,
// );

// import { postToConnection } from '../postToConnection';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async (event: any, context) => {
    try {
      const newImage = DynamoDB.Converter.unmarshall(
        event?.detail?.dynamodb?.NewImage,
      );
      const interactionData = Interaction.parse({ Item: newImage }).data;
      if (!interactionData) {
        return {
          statusCode: 500,
          body: 'Failed to parse the eventbridge event into a usable entity.',
        };
      }
      const { orgId, customerId, type } = interactionData;

      const bots = await appDb.entities.bots.query.byOrg({ orgId }).go();

      const triggers = bots?.data?.reduce<
        Record<string, BotNodeType[] | undefined>
      >(
        (prev, next) => ({
          ...prev,
          [`${next?.botId}`]: next?.nodes?.filter((node) => {
            const { type } = node;
            if (type && Object.values(Triggers).includes(type as any)) {
              return node;
            }
          }),
        }),
        {} as Record<string, BotNodeType[] | undefined>,
      );

      console.log(triggers);

      if (type === VisitorBotInteractionTrigger.VisitorClicksChatIcon) {
        // find the first trigger to match across all the bots
        const triggerMatch = Object.entries(triggers).find(
          ([botId, botTriggers]) =>
            botTriggers?.find(
              (trigger) =>
                trigger === VisitorBotInteractionTrigger.VisitorClicksChatIcon,
            ),
        );

        if (triggerMatch && triggerMatch?.[0]) {
          const conversation = await appDb.entities.conversations
            .create({ orgId, customerId, botId: triggerMatch?.[0] })
            .go();

          const bot = bots?.data.find(
            ({ botId }) => botId === triggerMatch?.[0],
          );

          const nextNodes = getNextNodes(
            triggerMatch[0],
            bot?.nodes,
            bot?.edges,
          );

          // create a botState for each connecting node
          const botStates: BotStateContext[] | undefined = nextNodes?.map(
            (nextNode) =>
              ({
                type: nextNode?.type,
                bot: bot,
                conversation: conversation?.data as ConversationItem,
                nextNode: nextNode,
                currentNode: triggerMatch[1],
                nodeContext: { currentId: triggerMatch?.[0] },
              }) as BotStateContext,
          );

          botStates?.forEach(
            async (botState) =>
              await sns
                .publish({
                  // Get the topic from the environment variable
                  TopicArn: Topic.BotNodeTopic.topicArn,
                  Message: JSON.stringify({
                    botState,
                  }),
                  MessageStructure: 'string',
                })
                .promise(),
          );
        }
      }

      if (type === VisitorBotInteractionTrigger.VisitorClicksChatIcon) {
      }
      // const customer = await appDb.entities.customers.query
      //   .primary({ orgId, customerId: customerId ?? '' })
      //   .go();

      // let filteredOperators = operators?.data;

      // await postToConnection(
      //   appDb,
      //   new ApiGatewayManagementApi({
      //     endpoint: WebSocketApi.appWs.httpsUrl,
      //   }),
      //   [...filteredOperators, ...customer.data],
      //   { type: 'createCustomer', body: customerData },
      // );

      return { statusCode: 200, body: 'Message sent' };
    } catch (err) {
      console.log('err');
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }),
);

const getNextNodes = (
  ancestorNodeId: string,
  nodes: BotNodeType[] | undefined,
  edges?: BotEdgeType[] | undefined,
) => {
  const nodeIds = edges
    ?.filter((edge) => edge.source === ancestorNodeId)
    .map(({ target }) => target);
  return nodes?.filter(({ id }) => nodeIds?.includes(id));
};
