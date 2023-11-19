import { EntityItem } from 'electrodb';
import Fuse from 'fuse.js';
import { TupleToObject } from 'helpers/typeUtilities';
import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { Article } from '@/entities/article';
import { ArticleContent } from '@/entities/articleContent';
import {
  ConversationItem,
  conversationItemSearchKey,
} from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { ExpandableField } from '../util/expandObjects';
import {
  ConversationFilterParams,
  listConversations,
} from './listByLastMessageSentAt';

export type ConversationSearchParams = {
  phrase: string;
} & ConversationFilterParams;

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
async function buildIndex(params: ConversationSearchParams) {
  const data = await scanAll(params);

  const options = {
    verbose: true,
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.1,
    includeScore: true,
    distance: 100000,
    minMatchCharLength: 3,
    includeMatches: true,
    keys: conversationItemSearchKey,
  };

  scanResult = new Fuse(data, options);
  lastScanDate = new Date().getTime();
  return scanResult;
}

/**
 * Queries conversastionItems
 * @date 25/06/2023 - 02:14:55
 *
 * @async
 * @param {string} orgId
 * @param {string} lang
 * @param {string} lang
 * @returns {unknown}
 */
async function scanAll(params: ConversationSearchParams) {
  let result: ConversationItem[] = [];

  // lastEvaluatedKey
  let lastCursor: string | null = 'init';
  while (lastCursor) {
    if (lastCursor !== 'init') {
      params.cursor = lastCursor;
    }
    console.log(params);
    const res = await listConversations({ ...params, includeMessages: true });
    if (res?.statusCode === 200) {
      const body = JSON.parse(res?.body ?? '');
      lastCursor = body.cursor;
      result = [...result, ...body.data];
    }
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
    const { orgId } = usePathParams();
    const params = {
      ...useQueryParams(),
      orgId,
    } as unknown as ConversationSearchParams;
    const expansionFields = useQueryParam('expansionFields')?.split(',') as (
      | 'customerId'
      | 'operatorId'
    )[];
    const {
      phrase,
      operatorId,
      cursor,
      customerId,
      includeMessages,
      updatedAt,
      status,
      channel,
    } = params;

    console.log(params);

    if (!orgId || !phrase) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
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
        await buildIndex({ ...params, expansionFields, includeMessages });
      }

      console.log(scanResult);
      const searchResult = scanResult.search(`${phrase}`);

      // console.log(scanResult, searchResult);
      return {
        statusCode: 200,
        body: JSON.stringify(searchResult),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
