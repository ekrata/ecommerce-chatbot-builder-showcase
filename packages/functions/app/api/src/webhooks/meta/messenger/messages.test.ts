// import { AxiosError } from 'axios';
// import { EntityItem } from 'electrodb';
// import { writeFile } from 'fs';
// import { Api } from 'sst/node/api';
// import { v4 as uuidv4 } from 'uuid';
// import { beforeAll, describe, expect, it } from 'vitest';

// import { faker } from '@faker-js/faker';

// import { getHttp } from '../../http';
// import { MockOrgIds } from '../../util';
// import { getMockMessengerMessage } from './mocks';

// // Seed db in vitest beforeAll, then use preexisitng ids
// const http = getHttp(`${Api.appApi.url}`);
// let mockOrgIds: MockOrgIds[] = [];
// beforeAll(async () => {
//   mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
//   if (!mockOrgIds) {
//     throw new Error('Mock Organisation undefined');
//   }
// });

// describe.concurrent(
//   '/webhooks/meta/messages',
//   async () => {
//     it('receives a /messages webhook with attachments', async () => {
//       const { orgId, customers } = mockOrgIds[0];
//       const { customerId, visitIds } = faker.helpers.arrayElement(customers);
//       const visitId = faker.helpers.arrayElement(visitIds);
//       const externalSenderMessageId = 'skakd129302i312';
//       const externalPageMessageId = 'skakd129302i312';
//       const message = getMockMessengerMessage(
//         externalSenderMessageId,
//         externalPageMessageId,
//         'mid.$cAAJdkrCd2ORnva8ErFhjGm0X_Q_c',
//         '',
//         'image',
//       );

//       const mockFbMessage = {};
//       const res = await http.get(
//         `/orgs/${orgId}/visits/${visitId}?expansionFields=${encodeURIComponent(
//           JSON.stringify(['customerId']),
//         )}`,
//       );
//       expect(res).toBeTruthy();
//       expect(res.status).toBe(200);
//       expect(res.data).toBeTruthy();
//       expect(res.data?.customerId).toEqual(customerId);
//       expect(res.data?.customer).toBeTruthy();
//       expect(res.data?.orgId).toEqual(orgId);
//     });
//     it('receives a new /messages webhook ', async () => {
//       const { orgId, customers } = mockOrgIds[0];
//       const { customerId, visitIds } = faker.helpers.arrayElement(customers);
//       const res = await http.get(
//         `/orgs/${orgId}/visits?expansionFields=${encodeURIComponent(
//           JSON.stringify(['customerId']),
//         )}`,
//       );
//       const { data } = res.data;
//       expect(res).toBeTruthy();
//       expect(res.status).toBe(200);
//       expect(data).toBeTruthy();
//       let lastVisitAt: number | undefined;
//       data.forEach((visit: EntityItem<typeof Visit>) => {
//         expect(visit.orgId).toEqual(orgId);
//         // check order
//         if (lastVisitAt) {
//           expect(visit.at).toBeLessThanOrEqual(lastVisitAt);
//           lastVisitAt = visit.at;
//         }
//       });
//       // save a mock visits object for frontend use
//       writeFile('./mocks/visits.json', JSON.stringify(res.data), 'utf8', () => {
//         expect(true).toEqual(true);
//       });
//     });
//     it('creates a visit', async () => {
//       const { orgId, customers } = mockOrgIds[0];
//       const { customerId, visitIds } = faker.helpers.arrayElement(customers);
//       const visitId = uuidv4();

//       const at = faker.date.recent().getTime();
//       const url = faker.internet.url();
//       const data: CreateVisit = {
//         customerId,
//         orgId,
//         at,
//         url,
//       };

//       // validate creation api
//       const res = await http.post(`/orgs/${orgId}/visits/${visitId}`, data);
//       expect(res).toBeTruthy();
//       expect(res.status).toBe(200);
//       expect(res.data).toBeTruthy();
//       expect(res.data?.customerId).toEqual(customerId);
//       expect(res.data?.visitId).toEqual(visitId);
//       expect(res.data?.orgId).toEqual(orgId);
//       expect(res.data?.url).toEqual(url);
//       expect(res.data?.at).toEqual(at);
//     });
//     it('updates the visit time', async () => {
//       const { orgId, customers } = mockOrgIds[1];
//       const { customerId, visitIds } = faker.helpers.arrayElement(customers);
//       const visitId = faker.helpers.arrayElement(visitIds);

//       // Get prexisting data for patch
//       const prepareRes = await http.get(`/orgs/${orgId}/visits/${visitId}`);
//       expect(prepareRes).toBeTruthy();
//       expect(prepareRes.status).toBe(200);

//       // patch
//       const { data } = prepareRes;
//       delete data?.customerId;
//       delete data?.orgId;
//       const at = Date.now();
//       const res = await http.patch(`/orgs/${orgId}/visits/${visitId}`, {
//         ...data,
//         at,
//       } as EntityItem<typeof Visit>);
//       expect(res).toBeTruthy();
//       expect(res.status).toBe(200);

//       // Validate patch with get
//       const getRes = await http.get(`/orgs/${orgId}/visits/${visitId}`);

//       expect(getRes).toBeTruthy();
//       expect(getRes.status).toBe(200);
//       expect(getRes.data).toBeTruthy();
//       expect(getRes.data?.customerId).toEqual(customerId);
//       expect(getRes.data?.orgId).toEqual(orgId);
//       expect(getRes.data?.at).toEqual(at);
//     });
//     it('deletes a visit', async () => {
//       const { orgId, customers } = mockOrgIds?.[2];
//       const { customerId, visitIds } = faker.helpers.arrayElement(customers);
//       const visitId = faker.helpers.arrayElement(visitIds);
//       const res = await http.delete(`/orgs/${orgId}/visits/${visitId}`);
//       expect(res).toBeTruthy();
//       expect(res.status).toBe(200);

//       // validate it doesn't exist anymore
//       try {
//         await http.get(`/orgs/${orgId}/visits/${visitId}`);
//       } catch (err) {
//         expect(err).toBeTruthy();
//         expect((err as AxiosError).response?.status).toBe(404);
//       }
//     });
//   },
//   { timeout: 100000 },
// );
