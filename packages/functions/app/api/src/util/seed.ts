import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import { faker } from '@faker-js/faker';
import * as Sentry from '@sentry/serverless';

import {
  ArticleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';
import {
  conversationChannel,
  conversationStatus,
  conversationTopic,
} from '../../../../../../stacks/entities/conversation';
import {
  CreateArticle,
  CreateArticleContent,
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
import { AppDb, getAppDb } from '../db';
import { MockArgs, mockArticleTitles, MockOrgIds } from './';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const db = appDb;
      const mockArgs: MockArgs = {
        mockLang: 'en',
        mockOrgCount: 3,
        mockCustomerCount: 5,
        mockOperatorCount: 2,
        mockArticleCount: 15,
        mockArticleSearchPhraseFreq: 4,
        mockSearchPhrase: `30-Day returns`,
        mockArticleHighlightCount: 5,
        mockConversationCountPerCustomer: 3,
        mockVisitsPerCustomer: 5,
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

export const seed = async (db: AppDb, mockArgs: MockArgs) => {
  const {
    mockLang,
    mockOrgCount,
    mockCustomerCount,
    mockOperatorCount,
    mockArticleCount,
    mockArticleSearchPhraseFreq,
    mockSearchPhrase,
    mockArticleHighlightCount,
    mockConversationCountPerCustomer,
    mockVisitsPerCustomer,
    mockMessageCountPerConversation,
  } = mockArgs;
  // org
  const orgId = uuidv4();
  const createOrg: CreateOrg = {
    orgId,
    name: faker.company.name(),
    email: faker.internet.email(),
  };
  await db.entities.orgs.create(createOrg).go();
  const mockOrg: Partial<MockOrgIds> = {} as Partial<MockOrgIds>;
  mockOrg.orgId = orgId;
  mockOrg.lang = mockLang;
  const createConfiguration: CreateConfiguration = {
    orgId,
  };

  const createTranslation: CreateTranslation = {
    orgId,
    lang: mockLang,
  };

  // config
  await db.entities.configurations.upsert(createConfiguration).go();

  // translation
  await db.entities.translations.upsert(createTranslation).go();

  // articles
  mockOrg.articleIds = (
    await Promise.all(
      Object.entries(mockArticleTitles).map(
        async ([category, articleTitles], i) => {
          return await Promise.all(
            articleTitles.map(async (title, j) => {
              const articleId = uuidv4();
              const articleContentId = uuidv4();
              const createArticle: CreateArticle = {
                articleId,
                articleContentId,
                orgId,
                lang: mockLang,
                status: faker.helpers.arrayElement(articleStatus),
                category: category as ArticleCategory,
                title: title,
                subtitle: 'This is a subtitle for this article.',
                highlight: i < mockArticleHighlightCount,
              };
              await db.entities.articles.create(createArticle).go();
              return { articleId, articleContentId };
            }),
          );
        },
      ),
    )
  ).flat();

  // article contents
  await Promise.all(
    mockOrg.articleIds.map(async ({ articleId, articleContentId }, i) => {
      const createArticleContent: CreateArticleContent = {
        articleContentId,
        articleId,
        orgId,
        lang: mockLang,
        content: `${faker.lorem.paragraphs(5)}${
          i < mockArticleSearchPhraseFreq && ` ${mockSearchPhrase} `
        }${faker.lorem.paragraphs(4)}`,
      };
      await db.entities.articleContents.create(createArticleContent).go();
      return articleContentId;
    }),
  );

  // operators
  await Promise.all(
    [...Array(mockOperatorCount)].map(async () => {
      const operatorId = uuidv4();
      const createOperator: CreateOperator = {
        operatorId,
        email: faker.internet.email(),
        orgId,
      };
      await db.entities.operators.create(createOperator).go();
    }),
  );

  const operators = await db.entities.operators.query.byOrg({ orgId }).go();

  mockOrg.operatorIds = operators.data.map((operator) => operator.operatorId);

  const ownerOperatorId = uuidv4();
  const createOwnerOperator: CreateOperator = {
    operatorId: ownerOperatorId,
    email: faker.internet.email(),
    orgId,
    permissionTier: 'owner',
  };
  await db.entities.operators.create(createOwnerOperator).go();
  mockOrg.ownerId = ownerOperatorId;

  const adminOperatorId = uuidv4();
  const createAdminOperator: CreateOperator = {
    operatorId: adminOperatorId,
    email: faker.internet.email(),
    orgId,
    permissionTier: 'admin',
  };
  await db.entities.operators.create(createAdminOperator).go();
  mockOrg.adminId = adminOperatorId;

  const moderatorOperatorId = uuidv4();
  const createModeratorOperator: CreateOperator = {
    operatorId: moderatorOperatorId,
    email: faker.internet.email(),
    orgId,
    permissionTier: 'moderator',
  };
  await db.entities.operators.create(createModeratorOperator).go();
  mockOrg.moderatorId = moderatorOperatorId;

  const visitedBaseUrl = faker.internet.url();
  mockOrg.customers = await Promise.all(
    [...Array(mockCustomerCount)].map(async () => {
      const customerId = uuidv4();
      const operator = faker.helpers.arrayElement(operators.data);
      const createCustomer: CreateCustomer = {
        customerId,
        orgId,
        email: faker.internet.email(),
        profilePicture: faker.image.people(),
        ip: faker.internet.ipv4(),
        locale: 'en-US',
        timezone: faker.address.timeZone(),
        userAgent: faker.internet.userAgent(),
        online: faker.datatype.boolean(),
        phone: faker.phone.number('501-###-###'),
      };

      const visitIds = await Promise.all(
        [...Array(mockVisitsPerCustomer)].map(async () => {
          const visitId = uuidv4();
          const createVisit: CreateVisit = {
            orgId: mockOrg.orgId ?? '',
            visitId,
            customerId,
            at: faker.date.recent().getTime(),
            url: `${visitedBaseUrl}/${faker.internet.domainWord()}`,
          };
          await db.entities.visits.create(createVisit).go();
          return visitId;
        }),
      );

      // const visits = await db.entities.visits.put(visitBodies).go();

      await db.entities.customers.create(createCustomer).go();
      const conversations = await Promise.all(
        [...Array(mockConversationCountPerCustomer)].map(
          async (_, conversationIndex) => {
            const conversationId = uuidv4();
            const status = faker.helpers.arrayElement(conversationStatus);
            const createConversation: CreateConversation = {
              conversationId,
              channel: faker.helpers.arrayElement(conversationChannel),
              topic: faker.helpers.arrayElement(conversationTopic),
              status,
              customerId,
              read: false,
              dismissed: false,
              orgId,
              operatorId: status === 'unassigned' ? '' : operator.operatorId,
            };
            await db.entities.conversations.create(createConversation).go();
            const messageIds = await Promise.all(
              [...Array(mockMessageCountPerConversation)].map(
                async (_, messageIndex) => {
                  const messageId = uuidv4();
                  const before = new Date();
                  before.setHours(before.getHours() - 2);
                  const createMessage: CreateMessage = {
                    messageId,
                    conversationId,
                    orgId,
                    customerId,
                    sentAt: faker.date.between(before, new Date()).getTime(),
                    content:
                      conversationIndex === 0 && messageIndex === 0
                        ? `${mockSearchPhrase} ${faker.lorem.lines()}`
                        : faker.lorem.lines(),
                    sender: faker.helpers.arrayElement(senderType),
                    operatorId: operator.operatorId,
                  };
                  await db.entities.messages.create(createMessage).go();
                  return messageId;
                },
              ),
            );
            return { conversationId, messageIds };
          },
        ),
      );
      return { customerId, conversations, visitIds };
    }),
  );
  return mockOrg;
};
