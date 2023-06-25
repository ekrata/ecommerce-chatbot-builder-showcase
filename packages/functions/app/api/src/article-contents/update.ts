import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';
import {
  UpdateArticle,
  UpdateArticleContent,
  UpdateTranslation,
} from '@/entities/entities';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, lang, articleContentId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      ...updateArticle
    }: UpdateArticleContent = useJsonBody();

    if (!orgId || !lang || !articleContentId || !updateArticle) {
      return {
        statusCode: 422,
        body: 'Failed to parse a param',
      };
    }

    try {
      delete updateArticle?.orgId;
      delete updateArticle?.lang;
      delete updateArticle?.articleContentId;
      const res = await appDb.entities.articleContents
        .patch({
          articleContentId,
          orgId,
          lang,
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
  })
);
