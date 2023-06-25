import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateArticle } from '@/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds, mockArticleSearchPhrase } from '../util/seed';
import { writeFile } from 'fs';
import { EntityItem } from 'electrodb';
import { Article } from '@/entities/article';
import {
  articleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

const lang = 'en';
describe.concurrent(
  '/articles: orgs/{orgId}/{lang}/articles (metadata)',
  async () => {
    it('gets a article', async () => {
      const { orgId, articleIds } = mockOrgIds[0];
      const [articleId, articleContentId] =
        faker.helpers.arrayElement(articleIds);
      const res = await http.get(
        `/orgs/${orgId}/${lang}/articles/${articleId}`
      );
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
      expect(res.data?.orgId).toEqual(orgId);
      expect(res.data?.articleId).toEqual(articleId);
      expect(res.data?.lang).toEqual(lang);
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

      // save a mock articles object for frontend use
      writeFile(
        './mocks/articles.json',
        JSON.stringify(res.data),
        'utf8',
        () => {
          expect(true).toEqual(true);
        }
      );
    });
    it(
      `full text searches for an article, with title, category or content that contains the searchPhrase: ${mockArticleSearchPhrase}`,
      async () => {
        const { orgId, articleIds, lang } = mockOrgIds[0];

        const res = await http.get(
          `/orgs/${orgId}/${lang}/articles/search?phrase=${mockArticleSearchPhrase}`
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
          }
        );
      },

      { timeout: 100000 }
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
        createArticle
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
      const [articleId, articleContentId] =
        faker.helpers.arrayElement(articleIds);
      // Get prexisting data for patch
      const prepareRes = await http.get(
        `/orgs/${orgId}/${lang}/articles/${articleId}`
      );
      expect(prepareRes).toBeTruthy();
      expect(prepareRes.status).toBe(200);

      // patch
      const article = prepareRes?.data as EntityItem<typeof Article>;
      const status = 'published';
      article.status = status;
      const res = await http.patch(
        `/orgs/${orgId}/${lang}/articles/${articleId}`,
        {
          ...article,
        }
      );
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);

      // validate with GET
      const getRes = await http.get(
        `/orgs/${orgId}/${lang}/articles/${articleId}`
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
      const [articleId, articleContentId] =
        faker.helpers.arrayElement(articleIds);
      const lang = 'en';
      const res = await http.delete(
        `/orgs/${orgId}/${lang}/articles/${articleId}`
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
  }
);
