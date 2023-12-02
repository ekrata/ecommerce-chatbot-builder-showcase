import { eachDayOfInterval, eachHourOfInterval } from 'date-fns';
import { writeFile } from 'fs/promises';
import pLimit from 'p-limit';
import { Api, ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { CreateOperator } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';
import { getHttp } from '../http';
import { MockArgs, MockOrgIds } from './';
import { seed } from './seed';

export interface SeedResponse {
  mockArgs: MockArgs;
  mockOrgIds: MockOrgIds[];
}

const http = getHttp(`${Api.appApi.url}`);

const limit = pLimit(5);

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
        mockCustomerCount: 20,
        mockOperatorCount: 4,
        mockBotCount: 4,
        mockArticleCount: 10,
        mockArticleSearchPhraseFreq: 4,
        mockSearchPhrase: `30-Day returns`,
        mockArticleHighlightCount: 5,
        mockConversationCountPerCustomer: 1,
        mockVisitsPerCustomer: 2,
        mockMessageCountPerConversation: 2,
        mockStartDate: new Date('2023-08-01').getTime(),
        mockEndDate: new Date('2023-12-01').getTime(),
        existingOperator: createOperator,
      };

      console.log('hi1');
      const mockOrgIds: (Partial<MockOrgIds> | null)[] = await Promise.all(
        [...Array(mockArgs.mockOrgCount)].map((_, i) => seed(db, mockArgs, i)),
      );

      console.log('hi');

      await writeFile(
        'packages/functions/app/api/src/util/mockOrgIds.json',
        JSON.stringify(mockOrgIds),
      );

      if (mockArgs.mockStartDate && mockArgs.mockEndDate) {
        const dates = eachDayOfInterval({
          start: mockArgs.mockStartDate,
          end: mockArgs.mockEndDate,
        });

        const fromTimestamp = mockArgs.mockStartDate;
        const endTimestamp = mockArgs.mockEndDate;

        // create an hourly analytic for duration
        await Promise.all(
          dates.map(async (date) => {
            return limit(() =>
              http.post(
                `/analytics/create-daily-analytic?fromTimestamp=${date.getTime()}`,
                {},
              ),
            );
          }),
        );

        // create weekly analytics for duration
        await http.post(
          `/analytics/combine-into-weekly-analytic?fromTimestamp=${fromTimestamp}&endTimestamp=${endTimestamp}`,
          {},
        );

        // create monthly analytics for duration
        await http.post(
          `/analytics/combine-into-monthly-analytic?fromTimestamp=${fromTimestamp}&endTimestamp=${endTimestamp}`,
          {},
        );
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ mockArgs, mockOrgs: mockOrgIds }),
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
