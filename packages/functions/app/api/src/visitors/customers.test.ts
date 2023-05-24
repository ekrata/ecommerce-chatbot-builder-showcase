import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateCustomer } from '../../../../../../stacks/entities/entities';
import { rating } from '../../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../../stacks/entities/customer';
import { getHttp } from '../http';
import { MockOrgIds } from '../util/seed';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('/customers', async () => {
  it('gets a customer', async () => {
    const { orgId, customers } = mockOrgIds[0];
    const { customerId } = faker.helpers.arrayElement(customers);
    const res = await http.get(`/orgs/${orgId}/customers/${customerId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.customerId).toEqual(customerId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists customers by org', async () => {
    const { orgId } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/customers`);
    const { data } = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(data).toBeTruthy();
    data.forEach((customer: EntityItem<typeof Customer>) => {
      expect(customer.orgId).toEqual(orgId);
    });
  });
  it('creates a customer', async () => {
    const { orgId } = mockOrgIds?.[0];
    const customerId = uuidv4();
    const email = faker.internet.email();
    const mailingSubscribed = true;
    const ip = faker.internet.ipv4();
    const locale = 'en';
    const phone = faker.phone.number();
    const starRating = faker.helpers.arrayElement(rating);
    const data: CreateCustomer = {
      customerId,
      orgId,
      email,
      mailingSubscribed,
      ip,
      locale,
      phone,
      rating: starRating,
    };

    // validate creation api
    const res = await http.post(`/orgs/${orgId}/customers/${customerId}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.customerId).toEqual(customerId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.email).toEqual(email);
    expect(res.data?.mailingSubscribed).toEqual(mailingSubscribed);
    expect(res.data?.ip).toEqual(ip);
    expect(res.data?.locale).toEqual(locale);
    expect(res.data?.phone).toEqual(phone);
  });
  it('updates the user agent and phone of a customer', async () => {
    const { orgId, customers } = mockOrgIds[1];
    const { customerId } = faker.helpers.arrayElement(customers);

    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/customers/${customerId}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const phone = faker.phone.number();
    const userAgent = faker.internet.userAgent();
    const { data } = prepareRes;
    delete data?.customerId;
    delete data?.orgId;
    const res = await http.patch(`/orgs/${orgId}/customers/${customerId}`, {
      ...data,
      phone,
      userAgent,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // Validate patch with get
    const getRes = await http.get(`/orgs/${orgId}/customers/${customerId}`);

    expect(getRes).toBeTruthy();
    expect(getRes.status).toBe(200);
    expect(getRes.data).toBeTruthy();
    expect(getRes.data?.customerId).toEqual(customerId);
    expect(getRes.data?.orgId).toEqual(orgId);
    expect(getRes.data?.phone).toEqual(phone);
    expect(getRes.data?.userAgent).toEqual(userAgent);
  });
  it('deletes a customer', async () => {
    const { orgId, customers } = mockOrgIds?.[2];
    const { customerId } = faker.helpers.arrayElement(customers);

    const res = await http.delete(`/orgs/${orgId}/customers/${customerId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/customers/${customerId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
