import Fuse from 'fuse.js';
import { ApiHandler, usePathParams, useQueryParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { Config } from 'sst/node/config';
import { Article } from '@/entities/article';
import { ResponseItem } from 'electrodb';

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
    limit: 10,
    isCaseSensitive: false,
    keys: ['username'],
  };

  console.info('REFRESHING THE INDEX');

  scanResult = new Fuse(data, options);
  lastScanDate = new Date().getTime();
  return scanResult;
}

/**
 * Scans over all articles, gathering the data of the search.
 * @date 25/06/2023 - 02:14:55
 *
 * @async
 * @param {string} orgIdParam
 * @param {string} langParam
 * @returns {unknown}
 */
async function scanAll(orgIdParam: string, langParam: string) {
  console.info('SCANNING ALL TABLE');
  const result = [];

  // lastEvaluatedKey
  let lek: string | null = 'init';
  while (lek) {
    const res = await appDb.entities.articles.scan
      .where(
        ({ orgId }, { eq }) => `
          ${eq(orgId, orgIdParam)}
        `
      )
      .go({
        params: { attributes: ['orgId', 'content'] },
        cursor: lek,
      });
    result.push(...res.data);
    lek = res.cursor;
  }
  return result;
}

/**
 * Handles the search request.
 * Also contains logic to trigger reindexing when the search object expires (RE: Lambda timelimit).
 * See https://awstip.com/the-best-search-engine-for-dynamodb-is-a-lambda-c2519e40b445 for a tutorial.
 *
 * TODO
 * Compare price between this in-memory method and storing the generated index every 15 minutes.
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
      // event.search is the search team
      console.debug('event', event);
      console.debug('lastScanDate', lastScanDate);
      // lastScanDate is the last time the dataset was updated (with that, we can set an expatriate for the fetched dataset)
      if (
        lastScanDate === undefined ||
        scanResult === undefined ||
        lastScanDate + 900000 < new Date().getTime()
      ) {
        await buildIndex(orgId, lang);
      }

      const res = scanResult.search(phrase, { limit: 10 }).map((i) => i.item);
      console.debug('SEARCH RESULT', res);
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
      return {
        statusCode: 404,
        body: `No configuration with orgId: ${orgId} exists. `,
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
