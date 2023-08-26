import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { MockArgs, MockOrgIds } from './';
import { seed } from './seed';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const db = appDb;
      const mockArgs: MockArgs = {
        mockLang: 'en',
        mockOrgCount: 1,
        mockCustomerCount: 1,
        mockOperatorCount: 1,
        mockArticleCount: 0,
        mockArticleSearchPhraseFreq: 4,
        mockSearchPhrase: `30-Day returns`,
        mockArticleHighlightCount: 5,
        mockConversationCountPerCustomer: 1,
        mockVisitsPerCustomer: 1,
        mockMessageCountPerConversation: 1,
      };
      const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
        [...Array(mockArgs.mockOrgCount)].map(() => seed(db, mockArgs)),
      );
      return {
        statusCode: 200,
        body: JSON.stringify(mockOrgIds),
      };
    } catch (err) {
      Sentry.captureException(JSON.stringify(err));
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
