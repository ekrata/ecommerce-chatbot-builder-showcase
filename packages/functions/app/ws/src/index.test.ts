import { describe, it, test, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { MockOrgIds } from 'packages/functions/app/api/src/util/seed';
import { getHttp } from 'packages/functions/app/api/src/http';
import { Api, WebSocketApi } from 'sst/node/api';
import { EntityItem } from 'electrodb';
import { Operator } from '@/entities/operator';
import { getWs } from '../../getWs';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('/ws', async () => {
  it('connects and then disconnects a operator socket', () =>
    new Promise((done) => {
      const { orgId, operatorIds } = mockOrgIds[0];
      const operatorId = faker.helpers.arrayElement(operatorIds);
      try {
        const ws = getWs(orgId, operatorId, 'operator');
        ws.onopen = (event) => {
          ws.ping();
          expect(true).toBeTruthy();
          console.log(event.type);
          http.get(`/orgs/${orgId}/operators/${operatorId}`).then((res) => {
            expect(res).toBeTruthy();
            expect(res.status).toBe(200);
            const operator: EntityItem<typeof Operator> = res?.data;
            expect(operator.connectionId).not.toEqual('');
            ws.close();
          });
        };
        ws.onclose = (event) => {
          expect(true).toBeTruthy();
          http.get(`/orgs/${orgId}/operators/${operatorId}`).then((res) => {
            expect(res).toBeTruthy();
            expect(res.status).toBe(200);
            const operator: EntityItem<typeof Operator> = res?.data;
            expect(operator.connectionId).toEqual('');
            done(event);
          });
        };
      } catch (err) {
        expect(false).toBeTruthy();
        done(err);
      }
    }));
});
