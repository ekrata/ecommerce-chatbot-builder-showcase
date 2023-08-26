import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { faker } from '@faker-js/faker';

import {
  Conversation,
  ConversationItem,
  ConversationTopic,
} from '../../../../../../stacks/entities/conversation';
import { CreateConversation } from '../../../../../../stacks/entities/entities';
import { getHttp } from '../http';
import {
  mockMessageCountPerConversation,
  MockOrgIds,
  mockSearchPhrase,
} from '../util/seed';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
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
      `/orgs/${orgId}/conversations/${conversationId}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('gets a conversation with operator and customer expanded', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const res = await http.get(
      `/orgs/${orgId}/conversations/${conversationId}?expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId']),
      )}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.operator.operatorId).toBeTruthy();
    expect(res.data?.customer.customerId).toBeTruthy();
  });
  it('gets a conversation with operator and customer expanded, and with messages included', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const res = await http.get(
      `/orgs/${orgId}/conversations/${conversationId}?includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId']),
      )}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversation.conversationId).toEqual(conversationId);
    expect(res.data?.conversation.orgId).toEqual(orgId);
    expect(res.data?.conversation.operator.operatorId).toBeTruthy();
    expect(res.data?.conversation.customer.customerId).toBeTruthy();
    expect(res.data?.messages).toBeTruthy();
    expect(res.data?.messages.length).toBeGreaterThan(0);
  }, 1000000);
  it('lists conversations by operator', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.get(
      `/orgs/${orgId}/conversations?operatorId=${operatorId}`,
    );
    const conversationsByOperator = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(conversationsByOperator?.data).toBeTruthy();
    conversationsByOperator.data.forEach(
      (conversation: EntityItem<typeof Conversation>) => {
        expect(conversation.orgId).toEqual(orgId);
        expect(conversation.operatorId).toEqual(operatorId);
      },
    );
    // save a mock operator-conversations response for frontend use
    writeFile(
      './mocks/operator-conversations.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it('lists conversations by operator', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.get(
      `/orgs/${orgId}/conversations?operatorId=${operatorId}`,
    );
    const conversationsByOperator = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(conversationsByOperator?.data).toBeTruthy();
    conversationsByOperator.data.forEach(
      (conversation: EntityItem<typeof Conversation>) => {
        expect(conversation.orgId).toEqual(orgId);
        expect(conversation.operatorId).toEqual(operatorId);
      },
    );
    // save a mock operator-conversations response for frontend use
    writeFile(
      './mocks/operator-conversations.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it('lists conversations by customer', async () => {
    const { orgId, operatorIds, customers } = mockOrgIds[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const res = await http.get(
      `/orgs/${orgId}/conversations?customerId=${customerId}`,
    );
    const { data, cursor } = res.data;
    const conversationsByCustomer = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(conversationsByCustomer?.data).toBeTruthy();
    conversationsByCustomer.data.forEach(
      (conversation: EntityItem<typeof Conversation>) => {
        expect(conversation.orgId).toEqual(orgId);
        expect(conversation.customerId).toEqual(customerId);
      },
    );
    // save a mock customer-conversations response for frontend use
    writeFile(
      './mocks/customer-conversations.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it('ConversationItem: lists conversations by customer, with customer and operator expanded, in descending order by last message sent at age, as well as conversation messages joined to the response.', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const res = await http.get(
      `/orgs/${orgId}/conversations-by-createdAt?customerId=${customerId}&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId']),
      )}`,
    );
    const { data, cursor } = res.data;
    const conversationsByCustomer = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(conversationsByCustomer?.data).toBeTruthy();
    conversationsByCustomer.data.forEach((conversation: ConversationItem) => {
      expect(conversation.conversation.orgId).toEqual(orgId);
      expect(conversation.conversation.customer.customerId).toEqual(customerId);
      // expect(conversation.conversation?.operator?.operatorId).toBeTruthy();
      expect(conversation?.messages?.length).toEqual(
        mockMessageCountPerConversation,
      );
    });

    // save a mock customer-conversation-items for frontend use
    writeFile(
      './mocks/customer-conversation-items.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it(`Full text searches for a conversationItem with a message containing text ${mockSearchPhrase}`, async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const res = await http.get(
      `/orgs/${orgId}/conversations/search?phrase=${mockSearchPhrase}&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId']),
      )}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res?.data).toBeTruthy();
    // has matches
    expect(res?.data.length).toEqual(5);

    writeFile(
      './mocks/conversationsOrgSearch.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  }, 100000);
  it('creates a conversation', async () => {
    const { orgId, customers } = mockOrgIds?.[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const conversationId = uuidv4();
    const status = 'unassigned';
    const channel = 'website';
    const type = 'chat';
    const topic: ConversationTopic = 'orderIssues';
    const data: CreateConversation = {
      conversationId,
      orgId,
      topic,
      customerId,
      operatorId: '',
      status,
      channel,
    };

    // validate creation api
    const res = await http.post(
      `/orgs/${orgId}/conversations/${conversationId}`,
      data,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.conversationId).toEqual(conversationId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.status).toEqual(status);
    expect(res.data?.channel).toEqual(channel);
    expect(res.data?.topic).toEqual(topic);

    it("assigns an operatorId to a conversation, then updates the status to 'open'", async () => {
      const { orgId, customers, operatorIds } = mockOrgIds[1];

      const operatorId = faker.helpers.arrayElement(operatorIds);
      const { conversations } = faker.helpers.arrayElement(customers);
      const { conversationId } = faker.helpers.arrayElement(conversations);

      // Get prexisting data for patch
      const prepareRes = await http.get(
        `/orgs/${orgId}/conversations/${conversationId}`,
      );
      expect(prepareRes).toBeTruthy();
      expect(prepareRes.status).toBe(200);

      // patch
      const status = 'open';
      const { data } = prepareRes;
      delete data?.conversationId;
      delete data?.orgId;
      const res = await http.patch(
        `/orgs/${orgId}/conversations/${conversationId}`,
        {
          ...data,
          operatorId,
          status,
        },
      );
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);

      // Validate patch with get
      const getRes = await http.get(
        `/orgs/${orgId}/conversations/${conversationId}`,
      );

      expect(getRes).toBeTruthy();
      expect(getRes.status).toBe(200);
      expect(getRes.data).toBeTruthy();
      expect(getRes.data?.conversationId).toEqual(conversationId);
      expect(getRes.data?.operatorId).toEqual(operatorId);
      expect(getRes.data?.orgId).toEqual(orgId);
      expect(getRes.data?.status).toEqual(status);
    });
  });
  it('deletes a conversation', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    const res = await http.delete(
      `/orgs/${orgId}/conversations/${conversationId}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/conversations/${conversationId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
