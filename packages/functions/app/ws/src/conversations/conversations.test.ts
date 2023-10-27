import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { SeedResponse } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import {
  Conversation,
  ConversationStatus,
  ConversationTopic,
  ExpandedConversation,
} from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { CreateConversation, UpdateConversation } from '@/entities/entities';
import { faker } from '@faker-js/faker';

import { WsAppDetailType } from '../../../../../../types/snsTypes';
import { MockOrgIds } from '../../../api/src/util';
import { WsAppEvent } from '../postToConnection';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  const seedResponse = (await http.post(`/util/small-seed-test-db`))
    ?.data as SeedResponse;
  mockOrgIds = seedResponse.mockOrgIds;
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe(
  'conversations',
  () => {
    it(`customer creates a conversation, a ddbstream 'conversation' create event is the processed by ddb-stream/processBatch,
   which then creates an sns event, which is put onto a queue, which then calls createConversation`, () =>
      new Promise((done) => {
        try {
          let doneCounter = 0;
          console.log(mockOrgIds);
          const {
            orgId,
            customers,
            operatorIds,
            adminId,
            ownerId,
            moderatorId,
          } = mockOrgIds[0];
          const operatorId = faker.helpers.arrayElement(operatorIds);
          const { conversations, customerId } =
            faker.helpers.arrayElement(customers);
          // const { conversationId } = faker.helpers.arrayElement(conversations);
          const newConversationId = uuidv4();
          const triggerDone = () => {
            doneCounter === 5 ? done(true) : null;
          };
          const validateEvent = (
            event: any,
            customerId: string,
            operatorId: string,
            clientType: string,
          ) => {
            const newConversationEvent = JSON.parse(event?.data.toString());
            const body = newConversationEvent.body as ExpandedConversation;
            const { type } = newConversationEvent;
            console.log(type);
            if (type === WsAppDetailType.wsAppCreateConversation) {
              console.log('validating', clientType, 'recieves conversation');
              expect(body.conversationId).toStrictEqual(newConversationId);
              expect(body.customerId).toStrictEqual(customerId);
              expect(body.operatorId).toStrictEqual('');
              expect(body?.customer?.customerId).toStrictEqual(customerId);
              doneCounter += 1;
              triggerDone();
            }
          };
          const status = 'unassigned';
          const channel = 'website';
          const type = 'chat';
          const topic: ConversationTopic = 'orderIssues';
          const data: CreateConversation = {
            conversationId: newConversationId,
            orgId,
            topic,
            customerId,
            operatorId: '',
            status,
            channel,
          };

          const wsCustomer = getWs(orgId, customerId, 'customer');
          const ws = getWs(orgId, operatorId, 'operator');
          const wsAdmin = getWs(orgId, adminId, 'operator');
          const wsModerator = getWs(orgId, moderatorId, 'operator');
          const wsOwner = getWs(orgId, ownerId, 'operator');
          wsOwner.onopen = (event) => {
            http
              .post(`/orgs/${orgId}/conversations/${newConversationId}`, data)
              .then((res) => {
                // const { operatorId } = res.data;
                console.log('opened');
                expect(true).toBeTruthy();
                ws.addEventListener('message', (event) =>
                  validateEvent(event, customerId, operatorId, 'operator'),
                );
                wsCustomer.addEventListener('message', (event) =>
                  validateEvent(event, customerId, operatorId, 'customer'),
                );
                wsAdmin.addEventListener('message', (event) =>
                  validateEvent(event, customerId, operatorId, 'admin'),
                );
                wsModerator.addEventListener('message', (event) =>
                  validateEvent(event, customerId, operatorId, 'moderator'),
                );
                wsOwner.addEventListener('message', (event) =>
                  validateEvent(event, customerId, operatorId, 'owner'),
                );
              });
          };
        } catch (err) {
          console.log(err);
          done(false);
        }
      }));
    it(`an operator is assigned to a conversastion, a ddbstream 'conversation' MODIFY event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls modify conversation`, () =>
      new Promise((done) => {
        try {
          let doneCounter = 0;
          console.log(mockOrgIds);
          const {
            orgId,
            customers,
            operatorIds,
            adminId,
            ownerId,
            moderatorId,
          } = mockOrgIds[0];
          const operatorId = faker.helpers.arrayElement(operatorIds);
          const { conversations, customerId } =
            faker.helpers.arrayElement(customers);
          const { conversationId } = faker.helpers.arrayElement(conversations);
          // const { conversationId } = faker.helpers.arrayElement(conversations);
          const triggerDone = () => {
            doneCounter === 5 ? done(true) : null;
          };

          const status: ConversationStatus = 'open';
          const validateEvent = (
            event: any,
            customerId: string,
            operatorId: string,
            clientType: string,
          ) => {
            const newConversationEvent = JSON.parse(
              event.data.toString(),
            ) as WsAppEvent;
            const body = newConversationEvent.body as ExpandedConversation;
            const { type } = newConversationEvent;
            if (type === WsAppDetailType.wsAppUpdateConversation) {
              console.log('validating', clientType, 'recieves conversation');
              expect(body.conversationId).toStrictEqual(conversationId);
              expect(body.customerId).toStrictEqual(customerId);
              expect(body.status).toStrictEqual(status);
              expect(body.operatorId).toStrictEqual(operatorId);
              expect(body?.customer?.customerId).toStrictEqual(customerId);
              expect(body?.operator?.operatorId).toStrictEqual(operatorId);
              doneCounter += 1;
              triggerDone();
            }
          };
          http
            .get(`/orgs/${orgId}/conversations/${conversationId}`)
            .then((res) => {
              const conversation: EntityItem<typeof Conversation> = res.data;
              const updateConversation: UpdateConversation = {
                ...conversation,
                operatorId,
                status,
              };

              const wsCustomer = getWs(orgId, customerId, 'customer');
              const ws = getWs(orgId, operatorId, 'operator');
              const wsAdmin = getWs(orgId, adminId, 'operator');
              const wsModerator = getWs(orgId, moderatorId, 'operator');
              const wsOwner = getWs(orgId, ownerId, 'operator');
              wsOwner.onopen = (event) => {
                http
                  .put(
                    `/orgs/${orgId}/conversations/${conversationId}`,
                    updateConversation,
                  )
                  .then((res) => {
                    console.log('got conversation put');
                    expect(true).toBeTruthy();
                    ws.addEventListener('message', (event) =>
                      validateEvent(event, customerId, operatorId, 'operator'),
                    );
                    wsCustomer.addEventListener('message', (event) =>
                      validateEvent(event, customerId, operatorId, 'customer'),
                    );
                    wsAdmin.addEventListener('message', (event) =>
                      validateEvent(event, customerId, operatorId, 'admin'),
                    );
                    wsModerator.addEventListener('message', (event) =>
                      validateEvent(event, customerId, operatorId, 'moderator'),
                    );
                    wsOwner.addEventListener('message', (event) =>
                      validateEvent(event, customerId, operatorId, 'owner'),
                    );
                  });
              };
            });
        } catch (err) {
          console.log(err);
          done(false);
        }
      }));
  },
  { timeout: 100000 },
);
