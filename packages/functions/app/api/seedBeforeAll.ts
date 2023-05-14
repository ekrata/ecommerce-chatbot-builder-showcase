import { http } from './http';
import { MockOrgIds } from './src/util/seed';

export const seedBeforeAll = async (): Promise<MockOrgIds[]> => {
  const res = await http.post(`/util/seed-test-db`);
  return res.data as MockOrgIds[];
};
