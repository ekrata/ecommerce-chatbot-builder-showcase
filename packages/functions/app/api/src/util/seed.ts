import { faker } from '@faker-js/faker';
import { ApiHandler } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import {
  CreateOrg,
  CreateOperator,
  CreateCustomer,
  CreateConversation,
  CreateMessage,
  CreateTranslation,
  CreateArticle,
} from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';
import { senderType } from '../../../../../../stacks/entities/message';
import {
  conversationChannel,
  conversationStatus,
  conversationType,
} from '../../../../../../stacks/entities/conversation';
import { Config } from 'sst/node/config';
import { CreateConfiguration } from '../../../../../../stacks/entities/entities';
import {
  articleCategory,
  articleStatus,
} from '../../../../../../stacks/entities/article';

export const mockOrgCount = 3;
export const mockCustomerCount = 5;
export const mockOperatorCount = 2;
export const mockArticleCount = 15;
export const mockArticleHighlightCount = 5;
export const mockConversationCountPerCustomer = 1;
export const mockMessageCountPerConversation = 10;
export const mockArticleSearchPhrase = `30-Day returns`;

export interface MockOrgIds {
  orgId: string;
  articleIds: string[];
  operatorIds: string[];
  customers: {
    customerId: string;
    conversations: { conversationId: string; messageIds: string[] }[];
  }[];
}

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const appDb = getAppDb(Config.REGION, Table.app.tableName);
      const db = appDb;
      const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
        [...Array(mockOrgCount)].map(async () => {
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
          const createConfiguration: CreateConfiguration = {
            orgId,
          };

          const createTranslation: CreateTranslation = {
            orgId,
            lang: 'en',
          };

          // config
          await db.entities.configurations.upsert(createConfiguration).go();

          // translation
          await db.entities.translations.upsert(createTranslation).go();

          // articles
          mockOrg.articleIds = await Promise.all(
            [...Array(mockArticleCount)].map(async (_, i) => {
              const articleId = uuidv4();
              const createArticle: CreateArticle = {
                articleId,
                orgId,
                status: faker.helpers.arrayElement(articleStatus),
                category: faker.helpers.arrayElement(articleCategory),
                title: faker.commerce.productName(),
                content: `${faker.lorem.paragraphs(2)}${
                  i % 3 === 0 && mockArticleSearchPhrase
                }${faker.lorem.paragraphs(1)}`,
                highlight: i < mockArticleHighlightCount,
              };
              await db.entities.articles.create(createArticle).go();
              return articleId;
            })
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
            })
          );

          const operators = await db.entities.operators.query
            .byOrg({ orgId })
            .go();

          mockOrg.operatorIds = operators.data.map(
            (operator) => operator.operatorId
          );
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
              console.log(createCustomer);
              await db.entities.customers.create(createCustomer).go();
              const conversations = await Promise.all(
                [...Array(mockConversationCountPerCustomer)].map(async () => {
                  const conversationId = uuidv4();
                  const status = faker.helpers.arrayElement(conversationStatus);
                  const createConversation: CreateConversation = {
                    conversationId,
                    channel: faker.helpers.arrayElement(conversationChannel),
                    type: faker.helpers.arrayElement(conversationType),
                    status,
                    customerId,
                    read: false,
                    dismissed: false,
                    orgId,
                    operatorId:
                      status === 'unassigned' ? '' : operator.operatorId,
                  };
                  await db.entities.conversations
                    .create(createConversation)
                    .go();
                  const messageIds = await Promise.all(
                    [...Array(mockMessageCountPerConversation)].map(
                      async () => {
                        const messageId = uuidv4();
                        const before = new Date();
                        before.setHours(before.getHours() - 2);
                        const createMessage: CreateMessage = {
                          messageId,
                          conversationId,
                          orgId,
                          customerId,
                          sentAt: faker.date
                            .between(before, new Date())
                            .getTime(),
                          content: faker.lorem.lines(),
                          sender: faker.helpers.arrayElement(senderType),
                          operatorId: operator.operatorId,
                        };
                        await db.entities.messages.create(createMessage).go();
                        return messageId;
                      }
                    )
                  );
                  return { conversationId, messageIds };
                })
              );
              return { customerId, conversations };
            })
          );
          return mockOrg;
        })
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
  })
);
