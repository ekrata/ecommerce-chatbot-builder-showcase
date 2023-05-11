import { describe, it, expect, beforeAll } from 'vitest';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { CreateConversation } from '../../../../../../stacks/entities/entities';
import { seedBeforeAll } from '../../seedBeforeAll';
import { MockOrgIds } from '../util/seed';
import { http } from '../../http';
import { Conversation } from '../../../../../../stacks/entities/conversation';

// Seed db in vitest beforeAll, then use preexisitng ids
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = await seedBeforeAll();
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});
describe('create conversation', async () => {
  it.only(
    'gets a conversation',
    async () => {
      const { orgId, customers } = faker.helpers.arrayElement(mockOrgIds);
      const { conversations } = faker.helpers.arrayElement(customers);
      const { conversationId } = faker.helpers.arrayElement(conversations);
      const res = await http.get(
        `/conversations/${conversationId}?orgId=${orgId}`
      );
      console.log(res.data);
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    },
    { timeout: 10000 }
  );
  it('lists conversations', async () => {
    const { customers } = mockOrgIds?.[2];
    const { customerId } = faker.helpers.arrayElement(customers);
    const data: CreateConversation = {
      orgId: 'invalidOrgId',
      customerId: 'invalidCustomerId',
      status: 'unassigned',
      channel: 'live',
      type: 'chat',
    };
    const res = await http.post(`/conversations`, data);
    console.log(res.data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(500);
  });
  it(
    'creates a conversation',
    async () => {
      const { orgId, customers } = mockOrgIds?.[0];
      const { customerId } = faker.helpers.arrayElement(customers);
      console.log(orgId, customerId);
      const data: CreateConversation = {
        orgId,
        customerId,
        status: 'unassigned',
        channel: 'live',
        type: 'chat',
      };
      const res = await http.post(`/conversations`, data);
      console.log(res.data);
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
    },
    { timeout: 10000 }
  );
  it(
    'Updates a conversation',
    async () => {
      const { customers } = mockOrgIds?.[2];
      const { customerId } = faker.helpers.arrayElement(customers);
      const data: CreateConversation = {
        orgId: 'invalidOrgId',
        customerId: 'invalidCustomerId',
        status: 'unassigned',
        channel: 'live',
        type: 'chat',
      };
      const res = await http.post(`/conversations`, data);
      console.log(res.data);
      expect(res).toBeTruthy();
      expect(res.status).toBe(500);
    },
    { timeout: 10000 }
  );
  it(
    'Deletes a conversation',
    async () => {
      const { customers } = mockOrgIds?.[2];
      const { customerId } = faker.helpers.arrayElement(customers);
      const data: CreateConversation = {
        orgId: 'invalidOrgId',
        customerId: 'invalidCustomerId',
        status: 'unassigned',
        channel: 'live',
        type: 'chat',
      };
      const res = await http.post(`/conversations`, data);
      console.log(res.data);
      expect(res).toBeTruthy();
      expect(res.status).toBe(500);
    },
    { timeout: 10000 }
  );
});
