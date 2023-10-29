import { SQSEvent } from 'aws-lambda';
import AWS, { DynamoDB } from 'aws-sdk';
import { EntityItem } from 'electrodb';
import { Api, ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';
import { v4 as uuidv4 } from 'uuid';

import { Message } from '@/entities/message';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import {
  Bot,
  BotEdgeType,
  BotNodeEvent,
  BotNodeType,
} from '../../../../../../stacks/entities/bot';
import {
  Conversation,
  ConversationItem,
} from '../../../../../../stacks/entities/conversation';
import { Interaction } from '../../../../../../stacks/entities/interaction';
import { getAppDb } from '../../../api/src/db';
import { getNewImage } from '../../../ws/src/helpers';
import {
  Triggers,
  VisitorBotInteractionTrigger,
} from '../bots/triggers/definitions.type';

const sns = new AWS.SNS();

export type BotStateContext = {
  type: BotNodeEvent;
  // interaction that started this bot
  interaction: EntityItem<typeof Interaction>;
  bot: EntityItem<typeof Bot>;
  conversation: ConversationItem;
  messages?: EntityItem<typeof Message>[];
  nextNode: BotNodeType;
  currentNode: BotNodeType;
};

// console.log(
//   new Blob([
//     JSON.stringify({
//       messages: botState,
//     }),
//   ]).size,
// );

// import { postToConnection } from '../postToConnection';

const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent, context) => {
    const appDb = getAppDb(Config.REGION, Table.app.tableName);
    console.log('processInteraction');
    try {
      const { Records } = event;
      for (const record of Records) {
        const newImage = getNewImage(record);
        const interactionData = Interaction.parse({ Item: newImage }).data;
        console.log(interactionData);
        if (!interactionData) {
          return {
            statusCode: 500,
            body: 'Failed to parse the eventbridge event into a usable entity.',
          };
        }

        const { type } = interactionData;
        const bots = await appDb.entities.bots.query
          .byOrg({ orgId: interactionData.orgId })
          .go();
        const botTriggers = getBotTriggers(bots?.data);
        const botStates = await processTrigger(
          interactionData,
          botTriggers,
          bots?.data,
          appDb,
        );

        console.log('publishing', botStates);
        botStates?.forEach(async (botState) => {
          console.log(
            'publishing',
            JSON.stringify({
              ...botState,
            }),
          );
          await sns
            .publish({
              // Get the topic from the environment variable
              TopicArn: Topic.BotNodeTopic.topicArn,
              Message: JSON.stringify({
                ...botState,
              }),
              MessageStructure: 'string',
            })
            .promise();
        });

        // if (type === VisitorBotInteractionTrigger.VisitorClicksChatIcon) {
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
      }
    } catch (err) {
      console.log('err');
      console.log(err);
      Sentry.captureException(err);
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  },
);

export const handler = middy(lambdaHandler).use(eventNormalizer());

export const getNextNodes = (
  ancestorNodeId: string,
  nodes?: BotNodeType[],
  edges?: BotEdgeType[],
) => {
  const nodeIds = edges
    ?.filter((edge) => edge.target === ancestorNodeId)
    .map(({ source }) => source);
  return nodes?.filter(({ id }) => nodeIds?.includes(id));
};

export const getBotTriggers = (bots: EntityItem<typeof Bot>[]) => {
  const triggers = bots?.reduce<Record<string, BotNodeType[] | undefined>>(
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
  return triggers;
};

export const processTrigger = async (
  interaction: EntityItem<typeof Interaction>,
  botTriggers: Record<string, BotNodeType[] | undefined>,
  bots: EntityItem<typeof Bot>[],
  appDb: ReturnType<typeof getAppDb>,
) => {
  const {
    orgId,
    customerId,
    botId,
    conversationId,
    operatorId,
    interactionId,
    status,
    channel,
  } = interaction;

  const triggerMatch = Object.entries(botTriggers).find(
    ([botId, triggers]) =>
      triggers?.find((trigger) => trigger.type === interaction.type),
  );
  const matchedBotId = triggerMatch?.[0];
  const matchedNode = triggerMatch?.[1]?.[0];
  const matchedNodeId = triggerMatch?.[1]?.[0]?.id;

  if (matchedBotId && matchedNodeId) {
    const bot = bots.find(({ botId }) => botId === matchedBotId);

    const newConversationId = uuidv4();

    // console.log('next Nodes', matchedNodeId, bot?.nodes, bot?.edges);

    const nextNodes = getNextNodes(matchedNodeId, bot?.nodes, bot?.edges);

    // console.log(nextNodes);

    const createConversationRes = await appDb.entities.conversations
      .put({
        ...{ status, channel },
        orgId,
        customerId,
        operatorId: interaction?.operatorId,
        botId: botId || bot?.botId,
        conversationId: conversationId || newConversationId,
      })
      .go();

    console.log(createConversationRes);
    // // console.log(createConversationRes);
    // // console.log(await createConversationRes.json());
    // const conversation: EntityItem<typeof Conversation> =
    //   await createConversationRes.json();

    // create a botState for each connecting node
    const botStates: BotStateContext[] | undefined = nextNodes?.map(
      (nextNode) =>
        ({
          type: nextNode?.type,
          bot,
          interaction,
          conversation: createConversationRes?.data as ConversationItem,
          nextNode,
          currentNode: matchedNode,
        }) as BotStateContext,
    );
    return botStates;
  }
};
