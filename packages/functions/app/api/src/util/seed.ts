import AWS from 'aws-sdk';
import fs from 'fs';
import pLimit from 'p-limit';
import { Api, ApiHandler } from 'sst/node/api';
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
import { getHttp } from '../http';
import { MockArgs, mockArticleTitles, MockOrgIds, TestBotKey } from './';

export interface SeedResponse {
  mockArgs: MockArgs;
  mockOrgIds: MockOrgIds[];
}

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const db = appDb;
      const mockArgs: MockArgs = {
        mockLang: 'en',
        mockOrgCount: 1,
        mockCustomerCount: 120,
        mockOperatorCount: 4,
        mockBotCount: 4,
        mockArticleCount: 25,
        mockArticleSearchPhraseFreq: 4,
        mockSearchPhrase: `30-Day returns`,
        mockArticleHighlightCount: 5,
        mockConversationCountPerCustomer: 4,
        mockVisitsPerCustomer: 5,
        mockMessageCountPerConversation: 10,
      };
      const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
        [...Array(mockArgs.mockOrgCount)].map((_, i) => seed(db, mockArgs, i)),
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ mockArgs, mockOrgs: mockOrgIds }),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(JSON.stringify(err));
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);

export const seed = async (db: AppDb, mockArgs: MockArgs, orgIndex: number) => {
  const {
    mockLang,
    mockCustomerCount,
    mockOperatorCount,
    mockArticleSearchPhraseFreq,
    mockSearchPhrase,
    mockArticleHighlightCount,
    mockConversationCountPerCustomer,
    mockVisitsPerCustomer,
    mockMessageCountPerConversation,
    mockBotCount,
    existingOperator,
  } = mockArgs;
  // org

  const s3 = new S3Client(Config.REGION);
  const orgId = uuidv4();
  const createOrg: CreateOrg = {
    orgId,
    name: `Test corp ${orgIndex}`,
    domain: 'localhost',
    email: faker.internet.email(),
  };
  await db.entities.orgs.create(createOrg).go();
  const mockOrg: Partial<MockOrgIds> = {} as Partial<MockOrgIds>;
  mockOrg.orgId = orgId;
  mockOrg.lang = mockLang;
  const avatarKey = `${orgId}-configuration-botLogo`;
  const logoKey = `${orgId}-configuration-logo`;
  const avatarCommand = new PutObjectCommand({
    ACL: 'public-read',
    Bucket: Bucket?.['echat-app-assets'].bucketName,
    Key: avatarKey,
    Body: fs.readFileSync(
      'packages/functions/app/api/src/util/test-avatar.png',
    ),
  });
  const logoCommand = new PutObjectCommand({
    ACL: 'public-read',
    Bucket: Bucket?.['echat-app-assets'].bucketName,
    Key: logoKey,
    Body: fs.readFileSync('packages/functions/app/api/src/util/test-logo.png'),
  });

  await s3.send(avatarCommand);
  await s3.send(logoCommand);

  const createConfiguration: CreateConfiguration = {
    orgId,
    channels: {
      liveChat: {
        appearance: {
          widgetAppearance: {
            botLogo: `https://${Bucket?.['echat-app-assets'].bucketName}.s3.amazonaws.com/${avatarKey}`,
            logo: `https://${Bucket?.['echat-app-assets'].bucketName}.s3.amazonaws.com/${logoKey}`,
          },
        },
      },
    },
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

  // const res = await fetch(
  //   `${Api.appApi.url}/nodes/create-article-vector-store`,
  // );

  // rearrange to select bots
  const bots = [
    botTemplates.SubscribeToMailingList,
    botTemplates.DiscountForNewVisitors,
    botTemplates.GeneralPurposeEcommerce,
    botTemplates.SalesBot,
  ];

  // create bots from templates
  mockOrg.botIds = await bots
    .slice(0, mockBotCount)
    .reduce<Promise<Record<TestBotKey, string>>>(
      async (prev, bot, i) => {
        const botId = uuidv4();
        const createBot = {
          ...bot,
          nodes: bot?.nodes?.map((node) => ({
            ...node,
            data: JSON.stringify(node?.data),
          })),
          edges: bot?.edges?.map((edge) => ({
            ...edge,
            data: JSON.stringify(edge?.data),
          })),
          botId,
          orgId,
        } as unknown as CreateBot;

        const res = await db.entities.bots.create(createBot).go();
        return { ...prev, [`${bot?.name as TestBotKey}`]: res?.data?.botId };
      },
      {} as Promise<Record<TestBotKey, string>>,
    );

  // create templates
  mockOrg.botTemplateIds = await Promise.all(
    Object.entries(botTemplates).map(async ([key, botTemplate]) => {
      const botTemplateId = uuidv4();
      const createBot = {
        ...botTemplate,
        nodes: botTemplate?.nodes?.map((node) => ({
          ...node,
          data: JSON.stringify(node?.data),
        })),
        edges: botTemplate?.edges?.map((edge) => ({
          ...edge,
          data: JSON.stringify(edge?.data),
        })),
        botTemplateId,
        orgId,
      } as unknown as CreateBotTemplate;

      await db.entities.botTemplates.create(createBot).go();
      return botTemplateId;
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
    createdAt: Date.now(),
    name: 'Sarah',
    language: '',
  };
  await db.entities.operators.create(createOwnerOperator).go();
  mockOrg.ownerId = ownerOperatorId;

  const adminOperatorId = '109111481709970940866';
  const createAdminOperator: CreateOperator = {
    operatorId: adminOperatorId,
    email: 'ekrata.adm1n@gmail.com',
    orgId,
    online: false,
    createdAt: Date.now(),
    name: 'Sarah',
    language: '',
    permissionTier: 'admin',
    profilePicture:
      'https://lh3.googleusercontent.com/a/ACg8ocLwBwV0ujV4Tk9fkLUa6kV8J4FwU3mixe2o5K6Dd0No=s96-c',
  };
  await db.entities.operators.create(createAdminOperator).go();
  mockOrg.adminId = adminOperatorId;

  const moderatorOperatorId = '117138631241434182915';
  const createModeratorOperator: CreateOperator = {
    email: 'ekrata.moderator@gmail.com',
    online: false,
    operatorId: moderatorOperatorId,
    createdAt: Date.now(),
    name: 'David',
    language: '',
    permissionTier: 'moderator',
    profilePicture:
      'https://lh3.googleusercontent.com/a/ACg8ocK4WppIGwk5SRE_MPFXFjGGM1m5InXADgwxq5Ybqeqj=s96-c',
    orgId,
  };
  mockOrg.moderatorId = moderatorOperatorId;

  if (existingOperator && orgIndex === 0) {
    console.log('creating existing operator', existingOperator, orgId);
    const res = await db.entities.operators
      .upsert({
        ...existingOperator,
        orgId: orgId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .go();
    mockOrg.mockGoogleAccountUserId = existingOperator.operatorId;
  }
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

      const conversations = (
        await Promise.all(
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
              const conversation = await db.entities.conversations
                .create(createConversation)
                .go();

              const adminConversation = await db.entities.conversations
                .create({
                  orgId,
                  operatorId: adminOperatorId,
                  channel: faker.helpers.arrayElement(conversationChannel),
                  topic: faker.helpers.arrayElement(conversationTopic),
                  status,
                  customerId,
                  read: false,
                  dismissed: false,
                })
                .go();

              const moderatorConversation = await db.entities.conversations
                .create({
                  orgId,
                  operatorId: moderatorOperatorId,
                  channel: faker.helpers.arrayElement(conversationChannel),
                  topic: faker.helpers.arrayElement(conversationTopic),
                  status,
                  customerId,
                  read: false,
                  dismissed: false,
                })
                .go();
              const ownerConversation = await db.entities.conversations
                .create({
                  orgId,
                  operatorId: ownerOperatorId,
                  channel: faker.helpers.arrayElement(conversationChannel),
                  topic: faker.helpers.arrayElement(conversationTopic),
                  status,
                  customerId,
                  read: false,
                  dismissed: false,
                })
                .go();

              const operatorConversation = await db.entities.conversations
                .create({
                  orgId,
                  operatorId: existingOperator?.operatorId ?? '',
                  channel: faker.helpers.arrayElement(conversationChannel),
                  topic: faker.helpers.arrayElement(conversationTopic),
                  status,
                  customerId,
                  read: false,
                  dismissed: false,
                })
                .go();

              return await Promise.all(
                [
                  conversation.data,
                  adminConversation.data,
                  moderatorConversation.data,
                  ownerConversation.data,
                  operatorConversation.data,
                ].map(async (conversation) => {
                  const { conversationId } = conversation;
                  const messageIds = await Promise.all(
                    [...Array(mockMessageCountPerConversation)].map(
                      async (_, messageIndex) => {
                        const messageId = uuidv4();
                        const before = new Date();
                        before.setHours(before.getHours() - 2);
                        console.log('zzz', conversation?.operatorId);
                        const createMessage: CreateMessage = {
                          messageId,
                          conversationId,
                          orgId,
                          customerId,
                          sentAt: faker.date
                            .between(before, new Date())
                            .getTime(),
                          content:
                            conversationIndex === 0 && messageIndex === 0
                              ? `${mockSearchPhrase} ${faker.lorem.lines()}`
                              : faker.lorem.lines(),
                          sender: faker.helpers.arrayElement(senderType),
                          operatorId: conversation?.operatorId ?? '',
                        };
                        const data = await db.entities.messages
                          .create(createMessage)
                          .go();
                        console.log(data);
                        return messageId;
                      },
                    ),
                  );
                  return { conversationId, messageIds };
                }),
              );
            },
          ),
        )
      ).flat();
      return { customerId, conversations, visitIds };
    }),
  );
  return mockOrg;
};
