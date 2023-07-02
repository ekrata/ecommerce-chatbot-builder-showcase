import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { Api } from 'sst/node/api';
import { CreateArticle, CreateArticleContent } from '@/entities/entities';
import { getHttp } from '../http';
import { MockOrgIds } from '../util/seed';
import { writeFile } from 'fs';
import { EntityItem } from 'electrodb';
import { Article } from '@/entities/article';
import {
  articleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';
import { ArticleContent } from '@/entities/articleContent';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.only('/article-contents: orgs/{orgId}/{lang}/article-contents', async () => {
  it('gets an articleContent', async () => {
    const { orgId, articleIds, lang } = mockOrgIds[0];
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    const res = await http.get(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.articleContentId).toEqual(articleContentId);
    // expect(articleIds.includes(res.data?.articleId)).toBeTruthy();
    expect(res.data?.lang).toEqual(lang);
  });

  it('lists articleContents by org and lang', async () => {
    const { orgId, lang } = mockOrgIds[0];
    const res = await http.get(`/orgs/${orgId}/${lang}/article-contents`);
    const articleContents = res.data;
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(articleContents?.data).toBeTruthy();
    articleContents.data.forEach(
      (article: EntityItem<typeof ArticleContent>) => {
        expect(article.orgId).toEqual(orgId);
        expect(article.lang).toEqual(lang);
      }
    );
    // save a mock articles object for frontend use
    writeFile(
      './mocks/articleContents.json',
      JSON.stringify(res.data),
      'utf8',
      () => {
        expect(true).toEqual(true);
      }
    );
  });
  it('creates an article AND articleContent', async () => {
    const { orgId, lang } = mockOrgIds[0];
    const articleId = uuidv4();
    const articleContentId = uuidv4();
    const createArticle: CreateArticle = {
      articleId,
      orgId,
      lang,
      status: faker.helpers.arrayElement(articleStatus),
      category: faker.helpers.arrayElement(articleCategory),
      title: faker.commerce.productName(),
      articleContentId: articleContentId,
    };

    // validate article creation
    let res = await http.post(
      `/orgs/${orgId}/${lang}/articles/${articleId}`,
      createArticle
    );

    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);
    expect(res.data?.articleId).toEqual(articleId);
    expect(res.data?.articleContentId).toEqual(articleContentId);

    const content = faker.lorem.paragraph(1);
    const createArticleContent: CreateArticleContent = {
      articleId,
      orgId,
      lang,
      content,
    };

    // use new article to create articleContent
    res = await http.post(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`,
      createArticleContent
    );

    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.orgId).toEqual(orgId);
    expect(res.data?.lang).toEqual(lang);
    expect(res.data?.articleId).toEqual(articleId);
    expect(res.data?.articleContentId).toEqual(articleContentId);
    expect(res.data?.content).toEqual(content);
  });
  it('updates the content of an articleContent', async () => {
    const { orgId, articleIds, lang } = mockOrgIds[1];
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    // Get prexisting data for patch
    const prepareRes = await http.get(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`
    );
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const article = prepareRes?.data as EntityItem<typeof ArticleContent>;
    const newContent = faker.lorem.paragraph(1);
    article.content = newContent;
    const res = await http.patch(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`,
      {
        ...article,
      }
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate with GET
    const getRes = await http.get(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`
    );
    const updatedConfig = getRes.data as EntityItem<typeof ArticleContent>;
    expect(updatedConfig.orgId).toEqual(orgId);
    expect(updatedConfig.lang).toEqual(lang);
    expect(updatedConfig.articleContentId).toEqual(articleContentId);
  });
  it('deletes a articleContent', async () => {
    const { orgId, articleIds, lang } = mockOrgIds?.[2];
    const { articleId, articleContentId } =
      faker.helpers.arrayElement(articleIds);
    const res = await http.delete(
      `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`
    );
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(
        `/orgs/${orgId}/${lang}/article-contents/${articleContentId}`
      );
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
