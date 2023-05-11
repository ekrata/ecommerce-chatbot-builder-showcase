import { faker } from '@faker-js/faker';
import { ApiHandler } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/serverless';
import {
  CreateOrg,
  CreateOperator,
  CreateCustomer,
  CreateConversation,
  CreateMessage,
} from '../../../../../../stacks/entities/entities';
import { appDb } from '../../db';
import {
  conversationChannel,
  conversationStatus,
  conversationType,
} from '../../../../../../stacks/entities/conversation';
import { messageSender } from '../../../../../../stacks/entities/message';

const orgCount = 10;
const customerCount = 20;
const operatorCount = 5;
const conversationCountPerCustomer = 3;
const messageCountPerConversation = 30;

interface MockOrgIds {
  orgId: string;
  operatorIds: string[];
  customers: {
    customerId: string;
    conversations: { conversationId: string; messageIds: string[] }[];
  }[];
}

export const seedTestDb = async () => {
  try {
    const mockOrgIds: Partial<MockOrgIds>[] = await Promise.all(
      [...Array(orgCount)].map(async () => {
        const orgId = uuidv4();
        const createOrg: CreateOrg = {
          orgId,
          name: faker.company.name(),
        };
        await appDb.entities.orgs.create(createOrg).go();
        const mockOrg: Partial<MockOrgIds> = {} as Partial<MockOrgIds>;

        [...Array(operatorCount)].map(async () => {
          const operatorId = uuidv4();
          const createOperator: CreateOperator = {
            operatorId,
            email: faker.internet.email(),
            orgId,
          };
          await appDb.entities.operators.create(createOperator).go();
        });

        const operators = await appDb.entities.operators.query
          .org({ orgId })
          .go();

        mockOrg.operatorIds = operators.data.map((operator) => operator.orgId);
        [...Array(customerCount)].map(async () => {
          const customerId = uuidv4();
          const createCustomer: CreateCustomer = {
            customerId,
            email: faker.internet.email(),
            orgId,
          };
          await appDb.entities.customers.create(createCustomer).go();
          const conversations = await Promise.all(
            [...Array(conversationCountPerCustomer)].map(async () => {
              const conversationId = uuidv4();
              const createConversation: CreateConversation = {
                conversationId,
                channel: faker.helpers.arrayElement(conversationChannel),
                type: faker.helpers.arrayElement(conversationType),
                status: faker.helpers.arrayElement(conversationStatus),
                customerId,
                orgId,
              };
              await appDb.entities.conversations
                .create(createConversation)
                .go();
              const messageIds = await Promise.all(
                [...Array(messageCountPerConversation)].map(async () => {
                  const messageId = uuidv4();
                  const before = new Date();
                  before.setHours(before.getHours() - 2);
                  const operator = faker.helpers.arrayElement(operators.data);
                  const createMessage: CreateMessage = {
                    messageId,
                    conversationId,
                    orgId,
                    customerId,
                    sentAt: faker.date.between(before, new Date()).getTime(),
                    content: faker.lorem.lines(),
                    sender: faker.helpers.arrayElement(messageSender),
                    operatorId: operator.operatorId,
                  };
                  await appDb.entities.messages.create(createMessage).go();
                  return messageId;
                })
              );
              return { conversationId, messageIds };
            })
          );
          mockOrg.customers?.push({ customerId, conversations });
        });
        return mockOrg;
      })
    );
    return mockOrgIds;
  } catch (err) {
    console.log(err);
    return err;
  }
};
