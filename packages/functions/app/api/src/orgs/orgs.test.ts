import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateOrg } from '@/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds, mockOrgCount } from '../util/seed';
import { orgPlanTier } from '../../../../../../stacks/entities/org';
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

describe.concurrent('/orgs', async () => {
  it('gets a org', async () => {
    const { orgId } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists orgs', async () => {
    const res = await http.get(`/orgs`);
    const { data } = res.data;

    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(data).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(mockOrgCount);
    // save a mock customer-conversation-items for frontend use
    writeFile('./mocks/orgs.json', JSON.stringify(res.data), 'utf8', () => {
      expect(true).toEqual(true);
    });
  });
  it('creates a org with of a random plan, operator seats and chatbot conversations', async () => {
    const orgId = uuidv4();
    const planTier = faker.helpers.arrayElement(orgPlanTier);
    const planOperatorSeats = 1;
    const planChatbotConversations = 50;
    const data: CreateOrg = {
      orgId,
      name: faker.company.name(),
      email: faker.internet.email(),
      planTier,
      planOperatorSeats,
      planChatbotConversations,
    };

    // validate creation api
    const res = await http.post(`/orgs/${orgId}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.planTier).toEqual(planTier);
    expect(res.data?.planOperatorSeats).toEqual(planOperatorSeats);
    expect(res.data?.planChatbotConversations).toEqual(
      planChatbotConversations
    );
  });
  it('updates the plan tier, and increases the number of chatbot conversations', async () => {
    const { orgId } = mockOrgIds[1];
    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const planTier = 'scale';
    const planChatbotConversations = 10000;
    const { data } = prepareRes;
    delete data?.orgId;
    const res = await http.patch(`/orgs/${orgId}`, {
      ...data,
      planTier,
      planChatbotConversations,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    const getRes = await http.get(`/orgs/${orgId}`);
    expect(getRes.data?.orgId).toEqual(orgId);
    expect(getRes.data?.planTier).toEqual(planTier);
    expect(getRes.data?.planChatbotConversations).toEqual(
      planChatbotConversations
    );
  });
  it('deletes a org', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    const res = await http.delete(
      `/orgs/${orgId}/conversations/${conversationId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
