import { ApiHandler, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';
import { Article, ArticleWithContent } from '@/entities/article';
import { EntityItem } from 'electrodb';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, articleId, lang } = usePathParams();
    if (!orgId || !articleId || !lang) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const articleRes = await appDb.entities.articles
        .get({ orgId, articleId, lang })
        .go();
      const articleContentRes = await appDb.entities.articleContents
        .get({
          orgId,
          lang,
          articleContentId: articleRes?.data?.articleContentId ?? '',
        })
        .go();
      if (articleRes.data && articleContentRes.data) {
        const withContent: ArticleWithContent = {
          ...articleRes.data,
          articleContent: articleContentRes.data,
        };
        return {
          statusCode: 200,
          body: JSON.stringify(withContent),
        };
      } else
        return {
          statusCode: 404,
          body: `ArticleContentId: ${
            articleRes?.data?.articleContentId ?? ''
          } does not refer to an existing ArticleContent`,
        };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  })
);
