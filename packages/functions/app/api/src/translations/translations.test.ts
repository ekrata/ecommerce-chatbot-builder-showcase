import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { CreateTranslation } from '@/entities/entities';
import { Translation } from '@/entities/translation';
import { faker } from '@faker-js/faker';

import { getHttp } from '../http';
import { MockOrgIds } from '../util/seed';
import { setupTranslation } from './helpers';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('orgs/${orgId}/translations/{lang}', async () => {
  it('gets a translation', async () => {
    const { orgId } = mockOrgIds[0];
    const lang = 'en';
    const res = await http.get(`/orgs/${orgId}/translations/${lang}`);
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
    const res = await http.post(`/orgs/${orgId}/translations/${lang}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);

    setupTranslation(res.data);
    // save a mock visits object for frontend use
    writeFile(
      './mocks/translation.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it(`updates the "We're Online" translation property`, async () => {
    const { orgId } = mockOrgIds[1];
    const lang = 'en';
    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/translations/${lang}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const translation = prepareRes?.data as EntityItem<typeof Translation>;
    const newTranslation = 'we are online';
    if (translation.translations?.chatWidget["We're online"]) {
      translation.translations.chatWidget["We're online"] = newTranslation;
    }
    const res = await http.patch(`/orgs/${orgId}/translations/${lang}`, {
      ...translation,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    const getRes = await http.get(`/orgs/${orgId}/translations/${lang}`);
    const updatedConfig = getRes.data as EntityItem<typeof Translation>;

    expect(updatedConfig.orgId).toEqual(orgId);
    expect(translation.translations.chatWidget["We're online"]).toEqual(
      newTranslation,
    );
  });
  it('deletes a translation', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const lang = 'en';

    const res = await http.delete(`/orgs/${orgId}/translations/${lang}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/translations/${lang}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
