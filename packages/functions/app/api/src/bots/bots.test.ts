import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { Bot } from '@/entities/bot';
import { faker } from '@faker-js/faker';

import { rating } from '../../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../../stacks/entities/customer';
import {
  CreateBot,
  CreateCustomer,
} from '../../../../../../stacks/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds } from '../util';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/small-seed-test-db`))
    .data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('/bots', async () => {
  it.only('gets a bot', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = faker.helpers.arrayElement(botIds);
    const res = await http.get(`/orgs/${orgId}/bots/${botId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.botId).toEqual(botId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists bots by org', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/bots`);
    const { data } = res.data;
    console.log(data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(data).toBeTruthy();
    botIds.map((botId: string) => {
      data.forEach((bot: EntityItem<typeof Bot>) => {
        expect(botIds.includes(botId)).toBeTruthy();
      });
    });

    // save a mock bots object for frontend use
    writeFile('./mocks/bots.json', JSON.stringify(res.data), 'utf8', () => {
      expect(true).toEqual(true);
    });
  });
  it('creates a bot', async () => {
    const { orgId } = mockOrgIds?.[0];
    const botId = uuidv4();
    const email = faker.internet.email();
    const mailingSubscribed = true;
    const ip = faker.internet.ipv4();
    const locale = 'en';
    const phone = faker.phone.number();
    const starRating = faker.helpers.arrayElement(rating);
    const data: CreateBot = {
      botId,
      orgId,
      category: 'General Information',
    };

    // validate creation api
    const res = await http.post(`/orgs/${orgId}/bots/${botId}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.botId).toEqual(botId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.email).toEqual(email);
    expect(res.data?.mailingSubscribed).toEqual(mailingSubscribed);
    expect(res.data?.ip).toEqual(ip);
    expect(res.data?.locale).toEqual(locale);
    expect(res.data?.phone).toEqual(phone);
  });
  it('updates the user agent and phone of a bot', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = faker.helpers.arrayElement(botIds);

    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/bots/${botId}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const phone = faker.phone.number();
    const userAgent = faker.internet.userAgent();
    const { data } = prepareRes;
    delete data?.botId;
    delete data?.orgId;
    const res = await http.patch(`/orgs/${orgId}/bots/${botId}`, {
      ...data,
      phone,
      userAgent,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // Validate patch with get
    const getRes = await http.get(`/orgs/${orgId}/bots/${botId}`);

    expect(getRes).toBeTruthy();
    expect(getRes.status).toBe(200);
    expect(getRes.data).toBeTruthy();
    expect(getRes.data?.botId).toEqual(botId);
    expect(getRes.data?.orgId).toEqual(orgId);
    expect(getRes.data?.phone).toEqual(phone);
    expect(getRes.data?.userAgent).toEqual(userAgent);
  });
  it('deletes a bot', async () => {
    const { orgId, botIds } = mockOrgIds?.[0];
    const botId = faker.helpers.arrayElement(botIds);

    const res = await http.delete(`/orgs/${orgId}/bots/${botId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/bots/${botId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
