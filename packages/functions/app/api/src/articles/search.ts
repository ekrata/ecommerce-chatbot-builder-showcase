import Fuse from 'fuse.js';
import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';
import { EntityItem } from 'electrodb';
import { ArticleContent } from '@/entities/articleContent';
import { Article } from '@/entities/article';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

/**
 * time elapsed since last scan
 * @date 25/06/2023 - 02:14:55
 *
 * @type {number}
 */
var lastScanDate = 0;

/**
 * scanResult is the object that FuseJS create for the search
 * @date 25/06/2023 - 02:14:55
 *
 * @type {Fuse<any>}
 */
var scanResult: Fuse<any>;

/**
 * Builds the search index
 *
 * @date 25/06/2023 - 02:14:55
 *
 * @async
 * @param {string} orgIdParam
 * @param {string} langParam
 * @returns {unknown}
 */
async function buildIndex(orgIdParam: string, langParam: string) {
  const data = await scanAll(orgIdParam, langParam);

  const options = {
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.6,
    includeScore: true,
    distance: 100000,
    minMatchCharLength: 4,
    includeMatches: true,
    keys: ['title', 'subtitle', 'category', 'content', 'author.name'],
  };

  console.info('REFRESHING THE INDEX');

  scanResult = new Fuse(data, options);
  console.debug(scanResult);
  lastScanDate = new Date().getTime();
  return scanResult;
}

/**
 * Queries the an org's article metadata,
 * then joins the metadata to it's respective articleContent,
 * so that both the metadata and the content can be searched.
 * @date 25/06/2023 - 02:14:55
 *
 * @async
 * @param {string} orgIdParam
 * @param {string} langParam
 * @returns {unknown}
 */
async function scanAll(orgId: string, lang: string) {
  console.info('SCANNING ALL TABLE');
  let result: EntityItem<typeof ArticleContent>[] = [];

  // lastEvaluatedKey
  let lastCursor: string | null = 'init';
  while (lastCursor) {
    console.log(lastCursor);

    // query the articles
    const articles: {
      data: EntityItem<typeof Article>[];
      cursor: string | null;
    } = await appDb.entities.articles.query
      .byOrg({ orgId, lang })
      .go(
        lastCursor && lastCursor !== 'init'
          ? { cursor: lastCursor, limit: 20 }
          : { limit: 20 }
      );

    // batch get the articles
    const articlesContent = await appDb.entities.articleContents
      .get(
        articles?.data?.map((article) => ({
          orgId: article.orgId,
          lang: article.lang,
          articleContentId: article.articleContentId,
        }))
      )
      .go();

    const articlesWithContent = articles?.data?.map((article, i) => ({
      ...article,
      content: articlesContent.data?.[i].content,
    }));

    lastCursor = articles.cursor;
    result = [...result, ...articlesWithContent];
  }
  return result;
}

/**
 * Handles the search request.
 * Also contains logic to trigger reindexing when the search object expires (RE: Lambda timelimit).
 * See https://awstip.com/the-best-search-engine-for-dynamodb-is-a-lambda-c2519e40b445 for a tutorial.
 *
 * TODO
 * Compare price between this in-memory method and storing(EFS) the generated index every 15 minutes.
 *
 * @date 25/06/2023 - 02:14:55
 *
 * @type {*}
 */
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, lang } = usePathParams();
    const { phrase } = useQueryParams();
    if (!orgId || !lang || !phrase) {
      return {
        statusCode: 422,
        body: 'Failed to parse one of the required inputs',
      };
    }
    try {
      // event.search is the search tea
      // lastScanDate is the last time the dataset was updated (with that, we can set an expatriate for the fetched dataset)
      if (
        lastScanDate === undefined ||
        scanResult === undefined ||
        lastScanDate + 900000 < new Date().getTime()
      ) {
        await buildIndex(orgId, lang);
      }

      const searchResult = scanResult.search(`=${phrase}`);
      return {
        statusCode: 200,
        body: JSON.stringify(searchResult),
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
