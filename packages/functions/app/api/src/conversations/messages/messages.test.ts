import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { AxiosError } from 'axios';
import { CreateMessage } from '../../../../../../../stacks/entities/entities';
import { MockOrgIds, mockMessageCountPerConversation } from '../../util/seed';
import { http } from '../../../http';
import { Message } from '../../../../../../../stacks/entities/message';
import { seedBeforeAll } from '../../../seedBeforeAll';

// Seed db in vitest beforeAll, then use preexisitng ids
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = await seedBeforeAll();
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});
describe.concurrent('messages', async () => {
  it('gets a message', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId, messageIds } =
      faker.helpers.arrayElement(conversations);
    const messageId = faker.helpers.arrayElement(messageIds);
    const res = await http.get(
      `/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.messageId).toEqual(messageId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists messages in a conversation', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const res = await http.get(
      `/orgs/${orgId}/conversations/${conversationId}/messages`
    );
    expect(res).toBeTruthy();
    expect(res?.status).toBe(200);
    const { data } = res?.data;
    expect(data?.length).toEqual(mockMessageCountPerConversation);
    data.forEach((message: EntityItem<typeof Message>) => {
      expect(message.orgId).toEqual(orgId);
      expect(message.conversationId).toEqual(conversationId);
    });
  });
  it('handles when a customer sends a message', async () => {
    const { orgId, customers, operatorIds } = mockOrgIds?.[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const messageId = uuidv4();
    const sender = 'customer';
    const content = faker.lorem.paragraph();
    const data: CreateMessage = {
      conversationId,
      orgId,
      customerId,
      operatorId,
      sender,
      content,
    };

    // validate creation api
    const res = await http.post(
      `/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`,
      data
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.messageId).toEqual(messageId);
    expect(res.data?.sender).toEqual(sender);
    expect(res.data?.content).toEqual(content);
  });
  it('deletes a message', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId, messageIds } =
      faker.helpers.arrayElement(conversations);
    const messageId = faker.helpers.arrayElement(messageIds);

    const res = await http.delete(
      `/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(
        `/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`
      );
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
