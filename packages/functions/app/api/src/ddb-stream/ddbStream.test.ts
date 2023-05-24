import { describe, it, expect, beforeAll } from 'vitest';
// import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Api } from 'sst/node/api';
import { getHttp } from '../http';
import { MockOrgIds } from '../util/seed';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

// const http = getHttp(`${Api.appApi.url}`);
describe.concurrent('/ddb-stream', async () => {
  it('processes a batch of Ddb Stream CDC', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.get(`/orgs/${orgId}/operators/${operatorId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.operatorId).toEqual(operatorId);
    expect(res.data?.orgId).toEqual(orgId);
  });
});
