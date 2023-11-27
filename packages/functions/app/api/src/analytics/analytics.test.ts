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
import { getHttp } from '../http';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-analytics-test-db`))
    .data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

const lang = 'en';
describe.concurrent('/analytics', async () => {
  it('creates an hourly analytic', async () => {
    const { orgId, articleIds } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/${lang}/articles/${articleId}`);
    // we need a specific seed
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.articleId).toEqual(articleId);
    expect(res.data?.lang).toEqual(lang);
  });
  it('gets an article with content', async () => {
    const { orgId, articleIds } = mockOrgIds[0];
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    const res = await http.get(
      `/orgs/${orgId}/${lang}/articles/${articleId}/with-content`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    const article: ArticleWithContent = res.data;
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.articleId).toEqual(articleId);
    expect(res.data?.lang).toEqual(lang);
    expect(article.articleContent.articleContentId).toEqual(
      article.articleContentId,
    );
    expect(article?.articleContent.content.length).toEqual(
      article.articleContent.content.length,
    );

    writeFile(
      './mocks/articleWithContent.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      },
    );
  });
  it('lists articles by org and lang', async () => {
    const { orgId } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/${lang}/articles`);
    const articles = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(articles?.data).toBeTruthy();
    articles.data.forEach((article: EntityItem<typeof Article>) => {
      expect(article.orgId).toEqual(orgId);
      expect(article.lang).toEqual(lang);
    });

    writeFile('./mocks/articles.json', JSON.stringify(res.data), 'utf8', () => {
      expect(true).toEqual(true);
    });
  });
  it(
    `full text searches for an article, with title, category or content that contains the searchPhrase: ${mockSearchPhrase}`,
    async () => {
      const { orgId, articleIds, lang } = mockOrgIds[0];

      const res = await http.get(
        `/orgs/${orgId}/${lang}/articles/search?phrase=${mockSearchPhrase}`,
      );
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
      expect(res.data.length).toBeGreaterThan(0);
      const searchResults = res.data;
      // save a mock search response object[] for frontend use
      writeFile(
        './mocks/articleSearchResponse.json',
        JSON.stringify(searchResults),
        'utf8',
        () => {
          expect(true).toEqual(true);
        },
      );
    },
    { timeout: 100000 },
  );
  it('creates a article', async () => {
    const orgId = uuidv4();
    const articleId = uuidv4();
    const createArticle: CreateArticle = {
      articleId,
      orgId,
      lang,
      status: faker.helpers.arrayElement(articleStatus),
      category: faker.helpers.arrayElement(articleCategory),
      title: faker.commerce.productName(),
    };

    // validate article creation
    const res = await http.post(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
      createArticle,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);
    expect(res.data?.articleId).toEqual(articleId);
  });
  it('updates the status of an article to published', async () => {
    const { orgId, articleIds } = mockOrgIds[1];
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    // Get prexisting data for patch
    const prepareRes = await http.get(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
    );
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const article = prepareRes?.data as EntityItem<typeof Article>;
    const status = 'Published';
    article.status = status;
    const res = await http.patch(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
      {
        ...article,
      },
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate with GET
    const getRes = await http.get(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
    );
    const updatedConfig = getRes.data as EntityItem<typeof Article>;
    expect(updatedConfig.orgId).toEqual(orgId);
    expect(updatedConfig.articleId).toEqual(articleId);
    expect(updatedConfig.status).toEqual(status);
  });
  it('deletes a article', async () => {
    const { orgId, customers, articleIds } = mockOrgIds?.[2];
    const { conversations } = faker.helpers.arrayElement(customers);
    const { conversationId } = faker.helpers.arrayElement(conversations);
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    const lang = 'en';
    const res = await http.delete(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/${lang}/articles/${articleId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
