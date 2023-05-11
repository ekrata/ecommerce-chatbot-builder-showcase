import { Api } from 'sst/node/api';
import { describe, it, expect } from 'vitest';
import { seedTestDb } from './src/util/seed';

export const setup = async () => {
  try {
    console.log('Seeding Test Database...');
    const mockOrgIds = await seedTestDb();
    console.log(mockOrgIds);
    // if (res.status !== 200) {
    //   console.log(res.status);
    //   console.log(await res.json());
    //   throw new Error(`Seeding Test DB failed`);
    // }
  } catch (err) {
    console.log(err);
  }
};
