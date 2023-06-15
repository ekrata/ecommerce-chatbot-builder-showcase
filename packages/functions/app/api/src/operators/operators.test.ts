import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { EntityItem } from 'electrodb';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateOperator } from '../../../../../../stacks/entities/entities';
import { Operator } from '../../../../../../stacks/entities/operator';
import { getHttp } from '../http';
import { MockOrgIds } from '../util/seed';
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

describe.concurrent('/operators', async () => {
  it('gets a operator', async () => {
    const { orgId, operatorIds } = mockOrgIds[0];
    const operatorId = faker.helpers.arrayElement(operatorIds);
    const res = await http.get(`/orgs/${orgId}/operators/${operatorId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.operatorId).toEqual(operatorId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('lists operators by org', async () => {
    const { orgId } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/operators`);
    const { data } = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(data).toBeTruthy();
    data.forEach((operator: EntityItem<typeof Operator>) => {
      expect(operator.orgId).toEqual(orgId);
    });
    // save a mock operators object for frontend use
    writeFile(
      './mocks/customers.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      }
    );
  });
  it('creates a operator', async () => {
    const { orgId } = mockOrgIds?.[0];
    const operatorId = uuidv4();
    const email = faker.internet.email();
    const name = faker.name.fullName();
    const data: CreateOperator = {
      operatorId,
      orgId,
      email,
      name,
    };

    // validate creation api
    const res = await http.post(`/orgs/${orgId}/operators/${operatorId}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.operatorId).toEqual(operatorId);
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.email).toEqual(email);
  });
  it('updates the email of an operator', async () => {
    const { orgId, operatorIds } = mockOrgIds[1];
    const operatorId = faker.helpers.arrayElement(operatorIds);

    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/operators/${operatorId}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const email = faker.internet.email();
    const { data } = prepareRes;
    delete data?.operatorId;
    delete data?.orgId;
    const res = await http.patch(`/orgs/${orgId}/operators/${operatorId}`, {
      ...data,
      email,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // Validate patch with get
    const getRes = await http.get(`/orgs/${orgId}/operators/${operatorId}`);

    expect(getRes).toBeTruthy();
    expect(getRes.status).toBe(200);
    expect(getRes.data).toBeTruthy();
    expect(getRes.data?.operatorId).toEqual(operatorId);
    expect(getRes.data?.email).toEqual(email);
  });
  it('deletes a operator', async () => {
    const { orgId, operatorIds } = mockOrgIds?.[2];
    const operatorId = faker.helpers.arrayElement(operatorIds);

    const res = await http.delete(`/orgs/${orgId}/operators/${operatorId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/operators/${operatorId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
