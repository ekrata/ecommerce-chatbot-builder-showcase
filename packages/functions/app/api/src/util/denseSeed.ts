import AWS from 'aws-sdk';
import fs from 'fs';
import { ApiHandler } from 'sst/node/api';
import { Bucket } from 'sst/node/bucket';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

import {
  ArticleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';
import {
  BotEdgeType,
  BotNodeType,
} from '../../../../../../stacks/entities/bot';
import {
  conversationChannel,
  conversationStatus,
  conversationTopic,
} from '../../../../../../stacks/entities/conversation';
import {
  CreateArticle,
  CreateArticleContent,
  CreateBot,
  CreateBotTemplate,
  CreateConfiguration,
  CreateConversation,
  CreateCustomer,
  CreateMessage,
  CreateOperator,
  CreateOrg,
  CreateTranslation,
  CreateVisit,
} from '../../../../../../stacks/entities/entities';
import { senderType } from '../../../../../../stacks/entities/message';
import * as botTemplates from '../botTemplates/templates';
import { AppDb, getAppDb } from '../db';
import { MockArgs, mockArticleTitles, MockOrgIds, TestBotKey } from './';
import { seed } from './seed';

export interface SeedResponse {
  mockArgs: MockArgs;
  mockOrgIds: MockOrgIds[];
}

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
        mockConversationCountPerCustomer: 4,
        mockAnalyticDaysCount: 1,
        mockVisitsPerCustomer: 2,
        mockMessageCountPerConversation: 2,
        existingOperator: createOperator,
      };
      const mockOrgIds: (Partial<MockOrgIds> | null)[] = await Promise.all(
        [...Array(mockArgs.mockOrgCount)].map((_, i) => seed(db, mockArgs, i)),
      );
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
