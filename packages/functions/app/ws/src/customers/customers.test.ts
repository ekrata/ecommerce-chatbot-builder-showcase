import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { CreateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { Operator } from '@/entities/operator';
import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe('conversations', () => {
  it(`customer starts a conversation, a ddbstream 'conversation' create event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls eventNewConversationForOperators`, () =>
    new Promise((done) => {
      const { orgId, customers, operatorIds } = mockOrgIds[0];
      const { conversations, customerId } =
        faker.helpers.arrayElement(customers);
      const { conversationId } = faker.helpers.arrayElement(conversations);
      try {
        http
          .get(`/orgs/${orgId}/conversations/${conversationId}`)
          .then((res) => {
            const { operatorId } = res.data;
            const ws = getWs(orgId, operatorId, 'operator');
            ws.onopen = (event) => {
              console.log('hi');
              ws.ping();
              expect(true).toBeTruthy();
              http.get(`/orgs/${orgId}/operators/${operatorId}`).then((res) => {
                expect(res).toBeTruthy();
                expect(res.status).toBe(200);
                const operator: EntityItem<typeof Operator> = res?.data;
                expect(operator.connectionId).not.toEqual('');
                ws.close();
                const newMessageId = uuidv4();
                const messageId = uuidv4();
                const sender = 'customer';
                const content = faker.lorem.paragraph();
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
                    { data },
                  )
                  .then(() => {
                    ws.onmessage?.((event) => {
                      console.log(event?.data);
                      const newMessage: EntityItem<typeof Message> = event.data;
                      console.log(newMessage);
                    });
                  });
              });
            };
          });
      } catch (err) {
        console.log(err);
        done(err);
      }
    }));
});
