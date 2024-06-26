import AWS from 'aws-sdk';
import { Api, ApiHandler, usePathParams } from 'sst/node/api';
import { beforeAll, describe, expect, it } from 'vitest';

// import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

import { getHttp } from '../http';
import { MockOrgIds } from '../util';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

const client = new AWS.EventBridge();

describe.concurrent('/ddb-stream', async () => {
  it('processes a batch of Ddb Stream CDC', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.post(`/ddb-stream/process-batch`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
  });
});
