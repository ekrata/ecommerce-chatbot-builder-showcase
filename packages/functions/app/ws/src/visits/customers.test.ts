import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { Customer } from '@/entities/customer';
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

describe('customers', () => {
  it(`a customer visits a new site link, a ddbstream 'visit' create event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'createVisit' wsApi route, notifying operators
    that are in an 'open' conversation with the customerId in the visit`, () =>
    new Promise((done) => {
      const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
        mockOrgIds[0];
      faker.helpers.arrayElement(customers);
      const operatorId = faker.helpers.arrayElement(operatorIds);
      let doneCounter = 0;

      const newCustomerId = uuidv4();
      const triggerDone = () => {
        doneCounter === 4 ? done(true) : null;
      };
      const validateEvent = (
        event: any,
        customerId: string,
        operatorId: string,
        clientType: string,
      ) => {
        const newCustomerEvent = JSON.parse(event.data.toString()) as WsEvent;
        const body = newCustomerEvent.body as EntityItem<typeof Customer>;
        const { type } = newCustomerEvent;
        if (type === 'createVisit') {
          console.log('validating', clientType, 'recieves customer');
          expect(body.customerId).toStrictEqual(customerId);
          doneCounter += 1;
          triggerDone();
        }
      };

      try {
        const ws = getWs(orgId, operatorId, 'operator');
        const wsAdmin = getWs(orgId, adminId, 'operator');
        const wsModerator = getWs(orgId, moderatorId, 'operator');
        const wsOwner = getWs(orgId, ownerId, 'operator');
        wsOwner.onopen = (event) => {
          console.log('creating customer');
          http.post(`/orgs/${orgId}/customers/${newCustomerId}`).then((res) => {
            // const wsCustomer = getWs(orgId, newCustomerId, 'customer');
            const { operatorId } = res.data;
            ws.addEventListener('message', (event) =>
              validateEvent(event, newCustomerId, operatorId, 'operator'),
            );
            wsAdmin.addEventListener('message', (event) =>
              validateEvent(event, newCustomerId, operatorId, 'admin'),
            );
            wsModerator.addEventListener('message', (event) =>
              validateEvent(event, newCustomerId, operatorId, 'moderator'),
            );
            wsOwner.addEventListener('message', (event) =>
              validateEvent(event, newCustomerId, operatorId, 'owner'),
            );
          });
        };
      } catch (err) {
        console.log(err);
        done(err);
      }
    }));
  it(`a customer has their connectionId set to '' when they leave a website, a ddbstream 'customer' update event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'updateCustomer' wsApi route`, () =>
    new Promise((done) => {
      const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
        mockOrgIds[0];
      const { customerId } = faker.helpers.arrayElement(customers);
      const operatorId = faker.helpers.arrayElement(operatorIds);
      let doneCounter = 0;

      const triggerDone = () => {
        doneCounter === 4 ? done(true) : null;
      };
      const validateEvent = (
        event: any,
        customerId: string,
        clientType: string,
      ) => {
        const newCustomerEvent = JSON.parse(event.data.toString()) as WsEvent;
        const body = newCustomerEvent.body as EntityItem<typeof Customer>;
        const { type } = newCustomerEvent;
        if (type === 'updateCustomer') {
          console.log('validating', clientType, 'recieves customer');
          expect(body.customerId).toStrictEqual(customerId);
          doneCounter += 1;
          triggerDone();
        }
      };

      try {
        const wsCustomer = getWs(orgId, customerId, 'customer');
        const ws = getWs(orgId, operatorId, 'operator');
        const wsAdmin = getWs(orgId, adminId, 'operator');
        const wsModerator = getWs(orgId, moderatorId, 'operator');
        const wsOwner = getWs(orgId, ownerId, 'operator');
        wsCustomer.onopen = (event) => {
          console.log('closing customer');
          wsCustomer.close();
          wsCustomer.onclose = () => {
            ws.addEventListener('message', (event) =>
              validateEvent(event, customerId, 'operator'),
            );
            wsAdmin.addEventListener('message', (event) =>
              validateEvent(event, customerId, 'admin'),
            );
            wsModerator.addEventListener('message', (event) =>
              validateEvent(event, customerId, 'moderator'),
            );
            wsOwner.addEventListener('message', (event) =>
              validateEvent(event, customerId, 'owner'),
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
