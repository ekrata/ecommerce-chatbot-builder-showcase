import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { UpdateArticle, UpdateTranslation } from '@/entities/entities';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, lang, articleId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // createdAt,
      ...updateArticle
    }: UpdateArticle = useJsonBody();

    if (!orgId || !lang || !articleId || !updateArticle) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      // delete updateArticle?.orgId;
      // delete updateArticle?.lang;
      // delete updateArticle?.articleId;
      const res = await appDb.entities.articles
        .patch({
          articleId,
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
  }),
);
