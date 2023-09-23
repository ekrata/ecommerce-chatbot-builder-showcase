import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { CreateOperator } from '@/entities/entities';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { MockArgs, MockOrgIds } from './';
import { seed } from './seed';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const db = appDb;
      const createOperator: CreateOperator = {
        online: false,
        operatorId: '101620729708291176316',
        createdAt: 1695509852344,
        email: 'ekrata.gm@gmail.com',
        name: 'HIGH',
        language: '',
        permissionTier: 'operator',
        profilePicture:
          'https://lh3.googleusercontent.com/a/ACg8ocKFAXsgjIHXNpur_wJ7BRYEr1eam90tJaE26AV5dot5=s96-c',
        updatedAt: 1695509859258,
        orgId: '90680fff-7621-4a9e-8d7f-ccb1a9379c2e',
        connectionId: '',
        region: '',
      };
      const mockArgs: MockArgs = {
        mockLang: 'en',
        mockOrgCount: 1,
        mockCustomerCount: 1,
        mockOperatorCount: 2,
        mockArticleCount: 0,
        mockArticleSearchPhraseFreq: 4,
        mockSearchPhrase: `30-Day returns`,
        mockArticleHighlightCount: 5,
        mockConversationCountPerCustomer: 1,
        mockVisitsPerCustomer: 1,
        mockMessageCountPerConversation: 1,
        existingOperator: createOperator,
      };
      const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
        [...Array(mockArgs.mockOrgCount)].map((_, i) => seed(db, mockArgs, i)),
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
