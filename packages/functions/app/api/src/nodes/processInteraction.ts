import { SQSEvent } from 'aws-lambda';
import AWS, { DynamoDB } from 'aws-sdk';
import { sub } from 'date-fns';
import { EntityItem } from 'electrodb';
import { Api, ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';
import { v4 as uuidv4 } from 'uuid';

import { Message } from '@/entities/message';
import { FirstVisitOnSiteData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/triggers/FirstVisitOnSite';
import { VisitorClicksOnChatIconData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/triggers/VisitorClicksOnChatIcon';
import { WsAppDetailType } from '@/types/snsTypes';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { Bot, BotNodeType } from '../../../../../../stacks/entities/bot';
import {
  Conversation,
  ConversationItem,
} from '../../../../../../stacks/entities/conversation';
import { Interaction } from '../../../../../../stacks/entities/interaction';
import { getAppDb } from '../../../api/src/db';
import { getNewImage } from '../../../ws/src/helpers';
import {
  triggerInterval,
  Triggers,
  VisitorBotInteractionTrigger,
  VisitorPageInteractionTrigger,
} from '../bots/triggers/definitions.type';
import { BotStateContext } from './botStateContext';
import { getBotTriggers } from './getBotTriggers';
import { getNextNodes } from './getNextNodes';

const sns = new AWS.SNS();

const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent, context) => {
    const appDb = getAppDb(Config.REGION, Table.app.tableName);
    console.log('processInteraction');
    try {
      const { Records } = event;
      for (const record of Records) {
        const newImage = getNewImage(record);
        const interactionData = Interaction.parse({ Item: newImage }).data;
        // console.log(interactionData);
        if (!interactionData) {
          return {
            statusCode: 500,
            body: 'Failed to parse the eventbridge event into a usable entity.',
          };
        }

        const { type } = interactionData;
        const bots = await appDb.entities.bots.query
          .byOrg({ orgId: interactionData.orgId })
          .where(({ active }, { eq }) => `${eq(active, true)}`)
          .go();
        console.log(bots?.data);
        const botTriggers = getBotTriggers(bots?.data);

        const botStates = await processTrigger(
          interactionData,
          botTriggers,
          bots?.data,
          appDb,
        );

        console.log('botStates', botStates);
        // inform client that this has triggered this node
        if (botStates?.length) {
          console.log('publishing');
          sns
            .publish({
              // Get the topic from the environment variable
              TopicArn: Topic.DdbStreamTopic.topicArn,
              Message: JSON.stringify({
                ...interactionData,
              }),
              MessageAttributes: {
                type: {
                  DataType: 'String',
                  StringValue: WsAppDetailType.wsAppTriggerStarted,
                },
              },
              MessageStructure: 'string',
            })
            .promise();
        }
        // console.log('publishing', botStates);
        botStates?.forEach(async (botState) => {
          // console.log(
          //   'publishing',
          //   JSON.stringify({
          //     ...botState,
          //   }),
          // );

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

export const isTriggerReady = (
  node: BotNodeType,
  interaction: EntityItem<typeof Interaction>,
) => {
  switch (node?.type) {
    case VisitorBotInteractionTrigger.VisitorClicksChatIcon:
      const visitorClicksOnChatIconData: VisitorClicksOnChatIconData =
        JSON.parse(node?.data ?? '{}');
      switch (visitorClicksOnChatIconData?.triggerInterval) {
        case 'send on every visit':
          return true;
        case 'send once per 24 hours':
          const yesterday = sub(Date.now(), {
            days: 1,
            seconds: 1,
          });
          // if not set, we return true
          return interaction.lastTriggered
            ? interaction.lastTriggered < yesterday.getTime()
            : true;
        case 'send only once per unique visitor': {
          // if never triggered, return true
          return !interaction?.lastTriggered;
        }
      }
    case VisitorPageInteractionTrigger.FirstVisitOnSite:
      // if never triggered, return true
      return !interaction.lastTriggered;
    default:
      return true;
  }
};

export const processTrigger = async (
  interaction: EntityItem<typeof Interaction>,
  botTriggers: Record<string, BotNodeType[] | undefined>,
  bots: EntityItem<typeof Bot>[],
  appDb: ReturnType<typeof getAppDb>,
) => {
  const { orgId, customerId, botId, conversationId, status, channel } =
    interaction;

  const triggerMatch = Object.entries(botTriggers).find(
    ([botId, triggers]) =>
      triggers?.find((trigger) => trigger.type === interaction.type),
  );
  const matchedBotId = triggerMatch?.[0];
  const matchedNode = triggerMatch?.[1]?.[0];
  const matchedNodeId = triggerMatch?.[1]?.[0]?.id;

  if (
    matchedBotId &&
    matchedNode?.type &&
    matchedNodeId &&
    isTriggerReady(matchedNode, interaction)
  ) {
    const customer = await appDb.entities.customers
      .get({
        orgId,
        customerId,
      })
      .go();
    if (customerId) {
      // start bot
      const bot = bots.find(({ botId }) => botId === matchedBotId);
      const newConversationId = uuidv4();
      const nextNodes = getNextNodes(matchedNodeId, bot?.nodes, bot?.edges);

      const createConversationRes = await appDb.entities.conversations
        .upsert({
          ...{ status, channel },
          orgId,
          customerId,
          operatorId: interaction?.operatorId,
          botId: botId || bot?.botId,
          conversationId: conversationId || newConversationId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .go({ response: 'all_new' });

      const customer = await appDb.entities.customers
        .update({
          orgId,
          customerId,
        })
        .set({ botId: botId || bot?.botId })
        .go({ response: 'all_new' });
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
  }
};
