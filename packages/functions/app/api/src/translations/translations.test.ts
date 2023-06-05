import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import {
  CreateConfiguration,
  CreateOrg,
  CreateTranslation,
} from '@/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds, mockOrgCount } from '../util/seed';
import { orgPlanTier } from '../../../../../../stacks/entities/org';
import { writeFile } from 'fs';
import { Translation } from '@/entities/translation';
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

describe.concurrent('orgs/${orgId}/translation/{locale}', async () => {
  it('gets a translation', async () => {
    const { orgId } = mockOrgIds[0];
    const lang = 'en';
    const res = await http.get(`/orgs/${orgId}/translation/${lang}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);
  });
  it('creates a translation', async () => {
    const orgId = uuidv4();
    const lang = 'en';
    const data: CreateTranslation = {
      orgId,
      lang,
    };

    // validate translation creation
    const res = await http.post(`/orgs/${orgId}/translation/${lang}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);

    // save a mock translation object for frontend use
    await writeFile(
      '../mocks/translation.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      }
    );
  });
  it('updates the name property', async () => {
    const { orgId } = mockOrgIds[1];
    const lang = 'en';
    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/translation/${lang}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const backgroundColor =
      'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500';
    const translation = prepareRes?.data as EntityItem<typeof Translation>;
    const newTranslation = 'we are online';
    if (translation.translations?.["We're online"]) {
      translation.translations["We're online"] = newTranslation;
    }
    const res = await http.patch(`/orgs/${orgId}/translation/${lang}`, {
      ...translation,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    const getRes = await http.get(`/orgs/${orgId}/translation`);
    const updatedConfig = getRes.data as EntityItem<typeof Translation>;
    expect(updatedConfig.orgId).toEqual(orgId);
    expect(translation.translations["We're online"]).toEqual(newTranslation);
  });
  it('deletes a translation', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);

    const res = await http.delete(`/orgs/${orgId}/translation`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/translation`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
