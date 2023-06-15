import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateConfiguration, CreateOrg } from '@/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds, mockOrgCount } from '../util/seed';
import { orgPlanTier } from '../../../../../../stacks/entities/org';
import { writeFile } from 'fs';
import { Configuration } from '@/entities/configuration';
import { EntityItem } from 'electrodb';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('orgs/${orgId}/configuration', async () => {
  it('gets a configuration', async () => {
    const { orgId } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/configuration`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('creates a configuration with default settings', async () => {
    const orgId = uuidv4();
    const data: CreateConfiguration = {
      orgId,
    };

    // validate configuration creation
    const res = await http.post(`/orgs/${orgId}/configuration`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);

    // save a mock translation object for frontend use
    writeFile(
      './mocks/configuration.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      }
    );
  });
  it('updates the default background color', async () => {
    const { orgId } = mockOrgIds[1];
    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/configuration`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const backgroundColor =
      'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500';
    const configuration = prepareRes?.data as EntityItem<typeof Configuration>;
    if (
      configuration.channels?.liveChat?.appearance?.widgetAppearance
        ?.backgroundColor
    ) {
      configuration.channels.liveChat.appearance.widgetAppearance.backgroundColor =
        backgroundColor;
    }
    const res = await http.patch(`/orgs/${orgId}/configuration`, {
      ...configuration,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    const getRes = await http.get(`/orgs/${orgId}/configuration`);
    const updatedConfig = getRes.data as EntityItem<typeof Configuration>;
    expect(updatedConfig.orgId).toEqual(orgId);
    expect(
      updatedConfig.channels?.liveChat?.appearance?.widgetAppearance
        ?.backgroundColor
    ).toEqual(backgroundColor);
  });
  it('deletes a configuration', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    const res = await http.delete(`/orgs/${orgId}/configuration`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/configuration`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
