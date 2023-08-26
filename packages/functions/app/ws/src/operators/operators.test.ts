import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { Customer } from '@/entities/customer';
import { CreateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { faker } from '@faker-js/faker';

import { WsEvent } from '../postToConnection';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/small-seed-test-db`))
    .data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe('operators', () => {
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
        const newOperatorEvent = JSON.parse(event.data.toString()) as WsEvent;
        const body = newOperatorEvent.body as EntityItem<typeof Operator>;
        const { type } = newOperatorEvent;
        if (type === 'createOperator') {
          console.log('validating', clientType, 'recieves operator');
          expect(body.operatorId).toStrictEqual(newOperatorId);
          doneCounter += 1;
          triggerDone();
        }
      };

      try {
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
        ws.onopen = (event) => {
          console.log('creating operator');
          http
            .post(`/orgs/${orgId}/operators/${newOperatorId}`, data)
            .then((res) => {
              console.log(res.data);
              // const wsOperator = getWs(orgId, newOperatorId, 'customer');
              ws.addEventListener('message', (event) =>
                validateEvent(event, 'operator'),
              );
              wsAdmin.addEventListener('message', (event) =>
                validateEvent(event, 'admin'),
              );
              wsModerator.addEventListener('message', (event) =>
                validateEvent(event, 'moderator'),
              );
              wsOwner.addEventListener('message', (event) =>
                validateEvent(event, 'owner'),
              );
            });
        };
      } catch (err) {
        console.log(err);
        done(err);
      }
    }));
  it.only(`a operator disconnencts, which sets their '' when they leave a website, a ddbstream 'operator' update event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'updateOperator' wsApi route`, () =>
    new Promise((done) => {
      const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
        mockOrgIds[0];
      const { customerId } = faker.helpers.arrayElement(customers);
      const operatorId = faker.helpers.arrayElement(operatorIds);
      let doneCounter = 0;

      const triggerDone = () => {
        doneCounter === 4 ? done(true) : null;
      };
      const validateEvent = (event: any, clientType: string) => {
        const newOperatorEvent = JSON.parse(event.data.toString()) as WsEvent;
        const body = newOperatorEvent.body as EntityItem<typeof Operator>;
        const { type } = newOperatorEvent;
        if (type === 'updateOperator' && body.connectionId === '') {
          console.log('validating', clientType, 'recieves operator');
          expect(body.connectionId).toStrictEqual('');
          expect(body.operatorId).toStrictEqual(operatorId);
          doneCounter += 1;
          triggerDone();
        }
      };

      try {
        const wsCustomer = getWs(orgId, customerId, 'customer');
        const wsAdmin = getWs(orgId, adminId, 'operator');
        const wsModerator = getWs(orgId, moderatorId, 'operator');
        const wsOwner = getWs(orgId, ownerId, 'operator');
        const ws = getWs(orgId, operatorId, 'operator');
        ws.onopen = (event) => {
          console.log('closing operator');
          ws.close();
          ws.onclose = () => {
            wsCustomer.addEventListener('message', (event) =>
              validateEvent(event, 'operator'),
            );
            wsAdmin.addEventListener('message', (event) =>
              validateEvent(event, 'admin'),
            );
            wsModerator.addEventListener('message', (event) =>
              validateEvent(event, 'moderator'),
            );
            wsOwner.addEventListener('message', (event) =>
              validateEvent(event, 'owner'),
            );
          };
        };
        // wsOwner.onopen = (event) => {
      } catch (err) {
        console.log(err);
        done(err);
      }
    }));
});
