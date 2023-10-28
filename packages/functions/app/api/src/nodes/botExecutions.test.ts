import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { WebSocketApi } from 'sst/node/websocket-api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { Message } from '@/entities/message';
import { WsAppDetailType } from '@/types/snsTypes';
import { faker } from '@faker-js/faker';

import {
  Bot,
  BotEdgeType,
  botNodeEvent,
  BotNodeType,
} from '../../../../../../stacks/entities/bot';
import {
  Conversation,
  ExpandedConversation,
  rating,
} from '../../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../../stacks/entities/customer';
import {
  CreateConversation,
  CreateInteraction,
} from '../../../../../../stacks/entities/entities';
import { getWs } from '../../../getWs';
import { WsAppEvent } from '../../../ws/src/postToConnection';
import { Triggers } from '../bots/triggers/definitions.type';
import { getAppDb } from '../db';
import { getHttp } from '../http';
import { MockOrgIds } from '../util';
import { SeedResponse } from '../util/seed';
import emailSubscribeBot from './botMocks/emailSubscribe.json';
import {
  getBotTriggers,
  getNextNodes,
  processTrigger,
} from './processInteraction';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  const res = (await http.post(`/util/small-seed-test-db`))
    ?.data as SeedResponse;
  mockOrgIds = res?.mockOrgIds;
});

// Below is a list of tests for bots.
// In these tests, we test the entire execution of a test from interaction trigger to end.
// Rather than test the infrastructure that pipes between the bot's node functions,
// we take the code inside and verify that each function/lambda in the code behaves as expected and
// we test to see if the outputted data is correct and expected for the next node.

describe.concurrent(
  'bot-executions',
  async () => {
    it.only('asks the user to subscribe to org emails', () =>
      new Promise(async (done) => {
        const { orgId, botIds, customers } = mockOrgIds[0];
        const { customerId } = faker.helpers.arrayElement(customers);
        const botId = botIds.emailSubscribe;
        const appDb = getAppDb(
          process.env.VITEST_REGION ?? '',
          process.env.VITEST_TABLE ?? '',
        );
        const botRes = await http.get(`/orgs/${orgId}/bots/${botId}`);
        expect(botRes).toBeTruthy();
        expect(botRes.status).toBe(200);
        expect(botRes.data).toBeTruthy();
        expect(botRes.data?.botId).toEqual(botId);
        expect(botRes.data?.orgId).toEqual(orgId);

        const botData: EntityItem<typeof Bot> = botRes?.data;

        const newInteractionId = uuidv4();
        const conversationStatus = 'unassigned';
        const conversationChannel = 'website';
        const interaction = await http.post(
          `/orgs/${orgId}/interactions/${newInteractionId}`,
          {
            interactionId: newInteractionId,
            type: Triggers.VisitorClicksChatIcon,
            conversationId: '',
            customerId,
            status: conversationStatus,
            channel: conversationChannel,
          } as CreateInteraction,
        );

        const { type } = interaction?.data;

        const bots = await http.get(`/orgs/${orgId}/bots`);

        const botTriggers = await getBotTriggers(bots?.data);

        const botStates = await processTrigger(
          interaction?.data,
          botTriggers,
          bots?.data,
        );

        expect(botStates?.[0].conversation.botId).toEqual(botId);
        expect(botStates?.[0].conversation.orgId).toEqual(orgId);
        expect(botStates?.[0].nextNode.id).toEqual(
          botData?.nodes?.find(({ id }) => id === botStates?.[0].nextNode?.id)
            ?.id,
        );
        expect(botStates?.[0].currentNode.id).toEqual(
          botData?.nodes?.find(
            ({ id }) => id === botStates?.[0].currentNode?.id,
          )?.id,
        );
        expect(botStates?.[0].nextNode.id).toEqual(
          getNextNodes(
            botStates?.[0].currentNode.id ?? '',
            botData?.nodes,
            botData?.edges,
          )?.[0]?.id,
        );
        console.log(WebSocketApi.appWs.url);
        const wsCustomer = getWs(orgId, customerId, 'customer');
        // const ws = getWs(orgId, operatorId, 'operator');
        // const wsAdmin = getWs(orgId, adminId, 'operator');
        // const wsModerator = getWs(orgId, moderatorId, 'operator');
        // const wsOwner = getWs(orgId, ownerId, 'operator');

        const recipientCount = 1;
        let createConversationDone = 0;
        let createMessageDone = 0;
        const triggerDone = () => {
          createConversationDone === recipientCount &&
          createMessageDone === recipientCount
            ? done(true)
            : null;
        };

        const validateEvent = (
          event: any,
          customerId: string,
          conversationId: string,
          botId: string,
          clientType: string,
        ) => {
          const newEvent = JSON.parse(event.data.toString()) as WsAppEvent;
          const { type } = newEvent;

          if (type === WsAppDetailType.wsAppCreateConversation) {
            const body = newEvent.body as ExpandedConversation;
            const { type } = newEvent;
            console.log(type);
            console.log('validating', clientType, 'recieves conversation');
            expect(body.conversationId).toStrictEqual(conversationId);
            expect(body.status).toStrictEqual(conversationStatus);
            expect(body.channel).toStrictEqual(conversationChannel);
            expect(body.customerId).toStrictEqual(customerId);
            expect(body.botId).toStrictEqual(customerId);
            expect(body.operatorId).toStrictEqual('');
            expect(body?.customer?.customerId).toStrictEqual(customerId);
            createMessageDone += 1;
            triggerDone();
          }
          if (type === WsAppDetailType.wsAppCreateMessage) {
            const body = newEvent.body as EntityItem<typeof Message>;
            const { type } = newEvent;
            console.log('validating', clientType, 'recieves conversation');
            expect(body.conversationId).toStrictEqual(conversationId);
            expect(body.customerId).toStrictEqual(customerId);
            expect(body.operatorId).toStrictEqual('');
            expect(body?.customerId).toStrictEqual(customerId);
            expect(body?.messageFormType).toStrictEqual(
              botNodeEvent.AskAQuestion,
            );
            createMessageDone += 1;
            triggerDone();
          }
        };

        wsCustomer.onopen = (event) => {
          //  http
          //     .post(`/orgs/${orgId}/conversations/${conversationId}`, data)
          //     .then((res) => {
          // const { operatorId } = res.data;
          console.log('opened');
          expect(true).toBeTruthy();
          // ws.addEventListener('message', (event) =>
          //   validateEvent(event, customerId, operatorId, 'operator'),
          // );
          wsCustomer.addEventListener('message', (event) =>
            validateEvent(
              event,
              customerId,
              botStates?.[0].conversation?.conversationId ?? '',
              botId,
              'customer',
            ),
          );
          // wsAdmin.addEventListener('message', (event) =>
          //   validateEvent(event, customerId, operatorId, 'admin'),
          // );
          // wsModerator.addEventListener('message', (event) =>
          //   validateEvent(event, customerId, operatorId, 'moderator'),
          // );
          // wsOwner.addEventListener('message', (event) =>
          //   validateEvent(event, customerId, operatorId, 'owner'),
          // );
        };
      }));
  },
  { timeout: 100000 },
);
