import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { UpdateArticle, UpdateArticleContent, UpdateTranslation } from '@/entities/entities';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, lang, articleContentId } = usePathParams();
    const { ...updateArticle }: UpdateArticleContent = useJsonBody();

    if (!orgId || !lang || !articleContentId || !updateArticle) {
      return {
        statusCode: 422,
        body: 'Failed to parse a param',
      };
    }

    try {
      // delete updateArticle?.orgId;
      // delete updateArticle?.lang;
      // delete updateArticle?.articleContentId;
      delete updateArticle?.articleId;
      delete updateArticle?.createdAt;
      delete updateArticle?.updatedAt;
      const res = await appDb.entities.articleContents
        .patch({
          orgId,
          lang,
          articleContentId,
        })
        .set({ ...updateArticle })
        .go();
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
