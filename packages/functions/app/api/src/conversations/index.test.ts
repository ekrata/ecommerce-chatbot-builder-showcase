import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { AxiosError } from 'axios';
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
describe.concurrent('/conversations', async () => {
  it('gets a conversation', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const res = await http.get(
      `/conversations/${conversationId}?orgId=${orgId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists conversations by operator', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.get(
      `/conversations?orgId=${orgId}&operatorId=${operatorId}`
    );
    const conversationsByOperator = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(conversationsByOperator?.data).toBeTruthy();
    conversationsByOperator.data.forEach(
      (conversation: EntityItem<typeof Conversation>) => {
        expect(conversation.orgId).toEqual(orgId);
        expect(conversation.operatorId).toEqual(operatorId);
      }
    );
  });
  it('creates a conversation', async () => {
    const { orgId, customers } = mockOrgIds?.[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const conversationId = uuidv4();
    const status = 'unassigned';
    const channel = 'website';
    const type = 'chat';
    const data: CreateConversation = {
      conversationId,
      orgId,
      customerId,
      status,
      type,
      channel,
    };

    // validate creation api
    const res = await http.post(`/conversations`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.status).toEqual(status);
    expect(res.data?.channel).toEqual(channel);
    expect(res.data?.type).toEqual(type);
  });
  it("assigns an operatorId to a conversation, then updates the status to 'open'", async () => {
    const { orgId, customers, operatorIds } = mockOrgIds[1];

    const operatorId = faker.helpers.arrayElement(operatorIds);
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    // Get prexisting data for patch
    const prepareRes = await http.get(
      `/conversations/${conversationId}?orgId=${orgId}`
    );
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const status = 'open';
    const { data } = prepareRes;
    const res = await http.patch(`/conversations`, {
      ...data,
      operatorId,
      status,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // Validate patch with get
    const getRes = await http.get(
      `/conversations/${conversationId}?orgId=${orgId}`
    );

    expect(getRes).toBeTruthy();
    expect(getRes.status).toBe(200);
    expect(getRes.data).toBeTruthy();
    expect(getRes.data?.conversationId).toEqual(conversationId);
    expect(getRes.data?.operatorId).toEqual(operatorId);
    expect(getRes.data?.orgId).toEqual(orgId);
    expect(getRes.data?.status).toEqual(status);
  });
  it('deletes a conversation', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    const res = await http.delete(
      `/conversations/${conversationId}?orgId=${orgId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/conversations/${conversationId}?orgId=${orgId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
