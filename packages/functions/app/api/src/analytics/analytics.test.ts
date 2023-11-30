import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { Article, ArticleWithContent } from '@/entities/article';
import { CreateArticle } from '@/entities/entities';
import { faker } from '@faker-js/faker';

import {
  articleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';
import { getAppDb } from '../db';
import { getHttp } from '../http';
import mockOrgIds from '../util/mockOrgIds.json';

// let mockOrgIds: MockOrgIds[] = [];

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api?.appApi?.url ?? ''}`);
const appDb = getAppDb(
  process?.env?.SST_Config_REGION ?? '',
  process.env.VITEST_TABLE ?? '',
);

const lang = 'en';
describe.concurrent('/analytics', async () => {
  it('creates an hourly analytic for every org', async () => {
    // seed is created at a certain time.
    // by default, seed will create mock data that was created within an hour
    // by getting the org.createdAt field from the mock org ids,
    // we can ensure that /create-hourly-analytic creates an analytic using the 1 hour timeframe
    // that the seeding occured, rather than seed every test run.

    const { orgId, articleIds, createdAt } = mockOrgIds[0];

    const res = await http.post(
      `/analytics/create-hourly-analytic?fromTimestamp=${createdAt}`,
    );
    // we need a specific seed
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    console.log(res.data);
    expect(res.data).toBeTruthy();
    // expect(res.data?.orgId).toEqual(orgId);
    // expect(res.data?.articleId).toEqual(articleId);
    // expect(res.data?.lang).toEqual(lang);
  });
});
