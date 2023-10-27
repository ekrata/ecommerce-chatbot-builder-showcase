import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { SeedResponse } from 'packages/functions/app/api/src/util/seed';
import { getWs } from 'packages/functions/app/getWs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { Customer } from '@/entities/customer';
import { CreateVisit } from '@/entities/entities';
import { Visit } from '@/entities/visit';
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
  'visits',
  () => {
    it(`a customer visits a new site link, a ddbstream 'visit' create event is the processed by ddb-stream/processBatch,
   which then creates an event for eventbridge, which then calls the 'createVisit' wsApi route, notifying operators
    that are in an 'open' conversation with the customerId in the visit`, () =>
      new Promise((done) => {
        const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
          mockOrgIds[0];
        faker.helpers.arrayElement(customers);
        const operatorId = faker.helpers.arrayElement(operatorIds);
        const { customerId } = faker.helpers.arrayElement(customers);
        let doneCounter = 0;

        const newVisitId = uuidv4();
        const url = faker.internet.url();
        const at = Date.now();
        const visitData: CreateVisit = {
          url,
          orgId,
          at,
          customerId,
        };
        const triggerDone = () => {
          doneCounter === 4 ? done(true) : null;
        };
        const validateEvent = (event: any, clientType: string) => {
          console.log('validating', clientType, 'recieves visit');
          const newVisitEvent = JSON.parse(event.data.toString()) as WsAppEvent;
          const body = newVisitEvent.body as EntityItem<typeof Visit>;
          const { type } = newVisitEvent;
          if (
            type === WsAppDetailType.wsAppCreateVisit &&
            body?.visitId === newVisitId
          ) {
            expect(body.visitId).toStrictEqual(newVisitId);
            expect(body.customerId).toStrictEqual(customerId);
            expect(body.url).toStrictEqual(url);
            expect(body.at).toStrictEqual(at);
            doneCounter += 1;
            triggerDone();
          }
        };

        try {
          const ws = getWs(orgId, operatorId, 'operator');
          const wsAdmin = getWs(orgId, adminId, 'operator');
          const wsModerator = getWs(orgId, moderatorId, 'operator');
          const wsOwner = getWs(orgId, ownerId, 'operator');

          let openCount = 0;

          const createVisit = () =>
            http
              .post(`/orgs/${orgId}/visits/${newVisitId}`, visitData)
              .then((res) => {
                // const wsCustomer = getWs(orgId, newCustomerId, 'customer');
                const { operatorId } = res.data;
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

          wsOwner.onopen = (event) => {
            console.log('owner opened');
            openCount += 1;
            openCount === 4 ? createVisit() : null;
          };
          ws.onopen = (event) => {
            console.log('op opened');
            openCount += 1;
            openCount === 4 ? createVisit() : null;
          };
          wsAdmin.onopen = (event) => {
            console.log('admin opened');
            openCount += 1;
            openCount === 4 ? createVisit() : null;
          };
          wsModerator.onopen = (event) => {
            console.log('mod opened');
            openCount += 1;
            openCount === 4 ? createVisit() : null;
          };
        } catch (err) {
          console.log(err);
          done(err);
        }
      }));
    // it(`a customer has their connectionId set to '' when they leave a website, a ddbstream 'customer' update event is the processed by ddb-stream/processBatch,
    //  which then creates an event for eventbridge, which then calls the 'updateCustomer' wsApi route`, () =>
    //   new Promise((done) => {
    //     const { orgId, customers, operatorIds, adminId, ownerId, moderatorId } =
    //       mockOrgIds[0];
    //     const { customerId } = faker.helpers.arrayElement(customers);
    //     const operatorId = faker.helpers.arrayElement(operatorIds);
    //     let doneCounter = 0;

    //     const triggerDone = () => {
    //       doneCounter === 4 ? done(true) : null;
    //     };
    //     const validateEvent = (
    //       event: any,
    //       customerId: string,
    //       clientType: string,
    //     ) => {
    //       const newCustomerEvent = JSON.parse(
    //         event.data.toString(),
    //       ) as WsAppEvent;
    //       const body = newCustomerEvent.body as EntityItem<typeof Customer>;
    //       const { type } = newCustomerEvent;
    //       if (type === 'updateCustomer') {
    //         console.log('validating', clientType, 'recieves customer');
    //         expect(body.customerId).toStrictEqual(customerId);
    //         doneCounter += 1;
    //         triggerDone();
    //       }
    //     };

    //     try {
    //       const wsCustomer = getWs(orgId, customerId, 'customer');
    //       const ws = getWs(orgId, operatorId, 'operator');
    //       const wsAdmin = getWs(orgId, adminId, 'operator');
    //       const wsModerator = getWs(orgId, moderatorId, 'operator');
    //       const wsOwner = getWs(orgId, ownerId, 'operator');
    //       wsCustomer.onopen = (event) => {
    //         console.log('closing customer');
    //         wsCustomer.close();
    //         wsCustomer.onclose = () => {
    //           ws.addEventListener('message', (event) =>
    //             validateEvent(event, customerId, 'operator'),
    //           );
    //           wsAdmin.addEventListener('message', (event) =>
    //             validateEvent(event, customerId, 'admin'),
    //           );
    //           wsModerator.addEventListener('message', (event) =>
    //             validateEvent(event, customerId, 'moderator'),
    //           );
    //           wsOwner.addEventListener('message', (event) =>
    //             validateEvent(event, customerId, 'owner'),
    //           );
    //         };
    //       };
    //       // wsOwner.onopen = (event) => {
    //     } catch (err) {
    //       console.log(err);
    //       done(err);
    //     }
    //   }));
  },
  { timeout: 30000 },
);
