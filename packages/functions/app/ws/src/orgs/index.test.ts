import { describe, it, test, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { ws } from 'packages/functions/app/ws';
import {
  MockOrgIds,
  seedBeforeAll,
} from 'packages/functions/app/api/src/seedBeforeAll';

// Seed db in vitest beforeAll, then use preexisitng ids
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = await seedBeforeAll();
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});
describe.concurrent('/ws', async () => {
  it('connects a customer to a websocket', () =>
    new Promise((done) => {
      const { orgId, operatorIds } = mockOrgIds[0];
      const operatorId = faker.helpers.arrayElement(operatorIds);
      ws(orgId, operatorId, 'operator')
        .on('open', (event: string | symbol) => {
          expect(event).toBeTruthy();
        })
        .on('close', () => done(true));
    }));
});
