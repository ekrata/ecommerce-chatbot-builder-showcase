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
} from '../../../../../../stacks/entities/entities';
import { appDb } from '../db';
import { senderType } from '../../../../../../stacks/entities/message';
import {
  conversationChannel,
  conversationStatus,
  conversationType,
} from '../../../../../../stacks/entities/conversation';

export const mockOrgCount = 3;
export const mockCustomerCount = 5;
export const mockOperatorCount = 2;
export const mockConversationCountPerCustomer = 1;
export const mockMessageCountPerConversation = 10;

export interface MockOrgIds {
  orgId: string;
  operatorIds: string[];
  customers: {
    customerId: string;
    conversations: { conversationId: string; messageIds: string[] }[];
  }[];
}

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const db = appDb(Table.app.tableName);
      const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
        [...Array(mockOrgCount)].map(async () => {
          const orgId = uuidv4();
          const createOrg: CreateOrg = {
            orgId,
            name: faker.company.name(),
            email: faker.internet.email(),
          };
          await db.entities.orgs.create(createOrg).go();
          const mockOrg: Partial<MockOrgIds> = {} as Partial<MockOrgIds>;
          mockOrg.orgId = orgId;

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
                email: faker.internet.email(),
                orgId,
              };
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
