import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { CreateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

import { getHttp } from '../../http';
import { MockOrgIds } from '../../util';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent(
  'sales',
  async () => {
    it('replies to a  sales', async () => {
      const { orgId, customers } = mockOrgIds[0];
      // const messageId = faker.helpers.arrayElement(messageIds);
      const res = await http.get(`/orgs/${orgId}/ai-bots/sales-v1/reply`);
      console.log(res);
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
    });
  },
  { timeout: 1000000 },
);
