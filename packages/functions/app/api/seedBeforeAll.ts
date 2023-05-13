import { Api } from 'sst/node/api';
import { http } from './http';
import { MockOrgIds } from './src/util/seed';

export const seedBeforeAll = async (): Promise<MockOrgIds[]> => {
  console.log('Seeding Test Database...');
  const res = await http.post(`${Api.api.url}/util/seed-test-db`);
  return res.data as MockOrgIds[];
};
