import { EntityItem } from 'electrodb';
import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { Api } from 'sst/node/api';
import { beforeAll, describe, expect, it, test } from 'vitest';

import { Operator } from '@/entities/operator';
import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

import { getWs } from '../../getWs';

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

describe.concurrent('/ws', async () => {
  it('connects, using an operatorId, sets the connection id and then disconnects', () =>
    new Promise(async (done) => {
      const { orgId, operatorIds } = mockOrgIds[0];
      const operatorId = faker.helpers.arrayElement(operatorIds);
      try {
        const ws = getWs(orgId, operatorId, 'operator');
        console.log(ws.url);
        ws.addEventListener('open', (event) => {
          ws.ping();
          expect(true).toBeTruthy();
          http.get(`/orgs/${orgId}/operators/${operatorId}`).then((res) => {
            expect(res).toBeTruthy();
            expect(res.status).toBe(200);
            const operator: EntityItem<typeof Operator> = res?.data;
            expect(operator.connectionId).not.toEqual('');
            ws.close();
            // ws.send('Hello Server!');
          });
        });
        ws.onclose = (event) => {
          ws.ping();
          done(event);
        };
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        done(err);
      }
    }));
  it('connects, using an customerId, sets the connection id and then disconnects', () =>
    new Promise(async (done) => {
      const { orgId, operatorIds, customers } = mockOrgIds[0];
      const { customerId } = faker.helpers.arrayElement(customers);
      try {
        const ws = getWs(orgId, customerId, 'customer');
        ws.addEventListener('open', (event) => {
          ws.ping();
          expect(true).toBeTruthy();
          http.get(`/orgs/${orgId}/customers/${customerId}`).then((res) => {
            expect(res).toBeTruthy();
            expect(res.status).toBe(200);
            const operator: EntityItem<typeof Operator> = res?.data;
            expect(operator.connectionId).not.toEqual('');
            ws.close();
            // ws.send('Hello Server!');
          });
        });
        ws.onclose = (event) => {
          ws.ping();
          done(event);
        };
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        done(err);
      }
    }));
});
