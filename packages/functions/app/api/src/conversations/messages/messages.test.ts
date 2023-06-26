import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { Message } from '@/entities/message';
import { CreateMessage } from '@/entities/entities';
import { getHttp } from '../../http';
import { MockOrgIds, mockMessageCountPerConversation } from '../../util/seed';
import { writeFile } from 'fs';

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
  'messages',
  async () => {
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
      // save mock messages object for frontend use
      writeFile(
        './mocks/messages.json',
        JSON.stringify(res.data),
        'utf8',
        () => {
          expect(true).toEqual(true);
        }
      );
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
  },
  { timeout: 100000 }
);
