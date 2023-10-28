import { EntityItem } from 'electrodb';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import {
  CreateConversation,
  CreateOperator,
  UpdateOperator,
} from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { getHttp } from 'packages/functions/app/api/src/http';
import { SeedResponse } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { WsAppDetailType } from '@/types/snsTypes';
import { faker } from '@faker-js/faker';

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
  'operators',
  () => {
    it(`a operator is created by an admin, a ddbstream 'operator' create event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'createOperator' wsApi route`, () =>
      new Promise((done) => {
        const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
          mockOrgIds[0];
        faker.helpers.arrayElement(customers);
        const operatorId = faker.helpers.arrayElement(operatorIds);
        const newOperatorId = uuidv4();
        let doneCounter = 0;

        const newCustomerId = uuidv4();
        const triggerDone = () => {
          doneCounter === 4 ? done(true) : null;
        };
        const validateEvent = (event: any, clientType: string) => {
          console.log('validating', clientType, 'recieves operator');
          const newOperatorEvent = JSON.parse(
            event.data.toString(),
          ) as WsAppEvent;
          const body = newOperatorEvent.body as EntityItem<typeof Operator>;
          const { type } = newOperatorEvent;
          if (
            type === WsAppDetailType.wsAppCreateOperator &&
            body.operatorId === newOperatorId
          ) {
            expect(body.operatorId).toStrictEqual(newOperatorId);
            doneCounter += 1;
            triggerDone();
          }
        };

        try {
          console.log(operatorId);
          const ws = getWs(orgId, operatorId, 'operator');
          const wsAdmin = getWs(orgId, adminId, 'operator');
          const wsModerator = getWs(orgId, moderatorId, 'operator');
          const wsOwner = getWs(orgId, ownerId, 'operator');
          const email = faker.internet.email();
          const name = faker.name.fullName();
          const data: CreateOperator = {
            operatorId: newOperatorId,
            orgId,
            email,
            name,
          };
          let openCount = 0;

          // only createOperator when all test connections are open
          const createOperator = () =>
            http
              .post(`/orgs/${orgId}/operators/${newOperatorId}`, data)
              ?.then((data) => {
                wsOwner.addEventListener('message', (event) => {
                  validateEvent(event, 'owner');
                });
                ws.addEventListener('message', (event) => {
                  validateEvent(event, 'operator');
                });
                wsAdmin.addEventListener('message', (event) => {
                  validateEvent(event, 'admin');
                });
                wsModerator.addEventListener('message', (event) => {
                  validateEvent(event, 'moderator');
                });
              });

          wsOwner.onopen = (event) => {
            console.log('owner opened');
            openCount += 1;
            openCount === 4 ? createOperator() : null;
          };
          ws.onopen = (event) => {
            console.log('operator opened');
            openCount += 1;
            openCount === 4 ? createOperator() : null;
          };
          wsAdmin.onopen = (event) => {
            console.log('admin opened');
            openCount += 1;
            openCount === 4 ? createOperator() : null;
          };
          wsModerator.onopen = (event) => {
            console.log('mod opened');
            openCount += 1;
            openCount === 4 ? createOperator() : null;
          };
        } catch (err) {
          console.log(err);
          done(err);
        }
      }));
    it(`a operator is updated, which sets their '' when they leave a website, a ddbstream 'operator' update event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'updateOperator' wsApi route`, () =>
      new Promise((done) => {
        const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
          mockOrgIds[0];
        const { customerId } = faker.helpers.arrayElement(customers);
        const operatorId = faker.helpers.arrayElement(operatorIds);
        let doneCounter = 0;

        const email = faker.internet.email();
        console.log(email);
        const triggerDone = () => {
          doneCounter === 5 ? done(true) : null;
        };
        const validateEvent = (event: any, clientType: string) => {
          console.log('validating', clientType, 'recieves operator');
          const newOperatorEvent = JSON.parse(
            event.data.toString(),
          ) as WsAppEvent;
          const body = newOperatorEvent.body as EntityItem<typeof Operator>;
          const { type } = newOperatorEvent;
          if (
            type === WsAppDetailType.wsAppUpdateOperator &&
            body.operatorId === operatorId &&
            body.email === email
          ) {
            // expect(body.operatorId).toStrictEqual(operatorId);
            expect(body.email).toStrictEqual(email);
            doneCounter += 1;
            triggerDone();
          }
        };

        const newConversationId = uuidv4();
        const conversationData: CreateConversation = {
          conversationId: newConversationId,
          operatorId,
          customerId,
          orgId,
          topic: 'orderIssues',
          status: 'open',
          channel: 'website',
        };
        http
          .post(
            `/orgs/${orgId}/conversations/${newConversationId}}`,
            conversationData,
          )
          .then(() => {
            try {
              const wsCustomer = getWs(orgId, customerId, 'customer');
              const wsAdmin = getWs(orgId, adminId, 'operator');
              const wsModerator = getWs(orgId, moderatorId, 'operator');
              const wsOwner = getWs(orgId, ownerId, 'operator');
              const ws = getWs(orgId, operatorId, 'operator');
              const data: UpdateOperator = {
                email: email,
              };
              let openCount = 0;
              // only createOperator when all test connections are open
              const putOperator = () => {
                http
                  .patch(`/orgs/${orgId}/operators/${operatorId}`, data)
                  .then(() => {
                    wsOwner.addEventListener('message', (event) => {
                      validateEvent(event, 'owner');
                    });
                    wsCustomer.addEventListener('message', (event) => {
                      validateEvent(event, 'customer');
                    });
                    ws.addEventListener('message', (event) => {
                      validateEvent(event, 'operator');
                    });
                    wsAdmin.addEventListener('message', (event) => {
                      validateEvent(event, 'admin');
                    });
                    wsModerator.addEventListener('message', (event) => {
                      validateEvent(event, 'moderator');
                    });
                  });
              };

              wsOwner.onopen = (event) => {
                openCount += 1;
                openCount === 5 ? putOperator() : null;
              };
              wsCustomer.onopen = (event) => {
                openCount += 1;
                openCount === 5 ? putOperator() : null;
              };
              ws.onopen = (event) => {
                openCount += 1;
                openCount === 5 ? putOperator() : null;
              };
              wsAdmin.onopen = (event) => {
                openCount += 1;
                openCount === 5 ? putOperator() : null;
              };
              wsModerator.onopen = (event) => {
                openCount += 1;
                openCount === 5 ? putOperator() : null;
              };

              // wsOwner.onopen = (event) => {
            } catch (err) {
              console.log(err);
              done(err);
            }
          });
      }));
  },

  { timeout: 50000 },
);
