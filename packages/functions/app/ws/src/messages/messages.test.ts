import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { Customer } from '@/entities/customer';
import { CreateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { Operator } from '@/entities/operator';
import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

import { WsEvent } from '../postToConnection';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe(
  'messages',
  () => {
    it(`customer sends a new message to an existing conversation, a ddbstream 'message' create event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls createMessage`, () =>
      new Promise((done) => {
        let doneCounter = 0;
        const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
          mockOrgIds[0];
        const { conversations, customerId } =
          faker.helpers.arrayElement(customers);
        const { conversationId } = faker.helpers.arrayElement(conversations);
        const newMessageId = uuidv4();
        const triggerDone = () => {
          doneCounter === 5 ? done(true) : null;
        };
        const validateEvent = (
          event: any,
          customerId: string,
          operatorId: string,
          clientType: string,
        ) => {
          console.log('validating', clientType, 'recieves message');
          const newMessageEvent = JSON.parse(event.data.toString()) as WsEvent;
          const body = newMessageEvent.body as EntityItem<typeof Message>;
          const { type } = newMessageEvent;
          expect(type).toEqual('createMessage');
          expect(body.messageId).toStrictEqual(newMessageId);
          expect(body.customerId).toStrictEqual(customerId);
          expect(body.operatorId).toStrictEqual(operatorId);
          doneCounter += 1;
          triggerDone();
        };
        try {
          http
            .get(`/orgs/${orgId}/conversations/${conversationId}`)
            .then((res) => {
              const { operatorId } = res.data;
              const wsCustomer = getWs(orgId, customerId, 'customer');
              const ws = getWs(orgId, operatorId, 'operator');
              const wsAdmin = getWs(orgId, adminId, 'operator');
              const wsModerator = getWs(orgId, moderatorId, 'operator');
              const wsOwner = getWs(orgId, ownerId, 'operator');
              wsOwner.onopen = (event) => {
                console.log('opened');
                expect(true).toBeTruthy();
                http
                  .get(`/orgs/${orgId}/operators/${operatorId}`)
                  .then((res) => {
                    console.log('get operator');
                    expect(res).toBeTruthy();
                    expect(res.status).toBe(200);
                    const operator: EntityItem<typeof Operator> = res?.data;
                    expect(operator.connectionId).not.toEqual('');
                    const sender = 'customer';
                    const content = faker.lorem.paragraph();
                    console.log(operatorId);
                    console.log(operator.connectionId);
                    console.log(operator.operatorId);
                    const data: CreateMessage = {
                      conversationId,
                      orgId,
                      customerId,
                      operatorId,
                      sender,
                      content,
                    };
                    http
                      .post(
                        `/orgs/${orgId}/conversations/${conversationId}/messages/${newMessageId}`,
                        data,
                      )
                      .then(() => {
                        console.log('created message');
                        ws.addEventListener('message', (event) =>
                          validateEvent(
                            event,
                            customerId,
                            operatorId,
                            'operator',
                          ),
                        );
                        wsCustomer.addEventListener('message', (event) =>
                          validateEvent(
                            event,
                            customerId,
                            operatorId,
                            'customer',
                          ),
                        );
                        wsAdmin.addEventListener('message', (event) =>
                          validateEvent(event, customerId, operatorId, 'admin'),
                        );
                        wsModerator.addEventListener('message', (event) =>
                          validateEvent(
                            event,
                            customerId,
                            operatorId,
                            'moderator',
                          ),
                        );
                        wsOwner.addEventListener('message', (event) =>
                          validateEvent(event, customerId, operatorId, 'owner'),
                        );
                      });
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
