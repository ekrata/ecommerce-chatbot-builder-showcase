import { EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { Configuration } from '@/entities/configuration';
import {
  Conversation,
  conversationChannel,
  ConversationStatus,
  conversationTopic,
  conversationType,
} from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Message, SenderType } from '@/entities/message';
import { Operator } from '@/entities/operator';
import { Org, orgPlanTier } from '@/entities/org';
import { Translation } from '@/entities/translation';
import { faker } from '@faker-js/faker';

import configuration from '../../../../../mocks/configuration.json';
import translation from '../../../../../mocks/translation.json';
import { DefaultTags } from './Chat.type';

/**
 * Description placeholder
 * @date 11/06/2023 - 16:42:31
 *
 * @returns {EntityItem<typeof Org>}
 */
export const createRandomOrg = (): EntityItem<typeof Org> => {
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  return {
    orgId: uuidv4(),
    name: faker.company.name(),
    email: faker.internet.email(),
    planTier: faker.helpers.arrayElement(orgPlanTier),
    planChatbotConversations: faker.helpers.arrayElement([
      1000, 5000, 10000, 20000, 50000, 100000,
    ]),
    planOperatorSeats: 5,
    billingCustomerId: uuidv4(),
    billingSubscriptionId: uuidv4(),
  };
};

/**
 * Loads a configuration object mock resembeling a GET/ configuration response from the API
 * @date 11/06/2023 - 16:42:31
 *
 * @param {string} orgId
 * @returns {EntityItem<typeof Configuration>}
 */
export const loadConfiguration = (
  orgId: string,
): EntityItem<typeof Configuration> => {
  return {
    ...(configuration as EntityItem<typeof Configuration>),
    orgId,
  };
};

/**
 * @date 11/06/2023 - 16:42:31
 *
 * @param {string} orgId
 * @param {string} conversationId
 * @param {string} operatorId
 * @param {string} customerId
 * @param {?number} [typing]
 * @returns {EntityItem<typeof Message>}
 */
export const createRandomMessage = (
  orgId: string,
  conversationId: string,
  operatorId: string,
  customerId: string,
  typing?: number,
): EntityItem<typeof Message> => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  const sentAt = faker.date.between(twoHoursAgo, now).getTime();
  return {
    orgId,
    messageId: faker.datatype.uuid(),
    conversationId,
    operatorId,
    customerId,
    context: 'message',
    sender: faker.helpers.arrayElement(['operator', 'customer']),
    sentAt: typing ? undefined : sentAt,
    seenAt: sentAt,
    updatedAt: now.getTime(),
    createdAt: now.getTime(),
    content: faker.lorem.paragraph(),
  };
};

/**
 * Creates random messages of count
 * @date 11/06/2023 - 16:42:31
 *
 * @param {Parameters<typeof createRandomMessage>} params
 * @param {number} count
 * @returns {*}
 */
export const createRandomMessages = (
  params: Parameters<typeof createRandomMessage>,
  count: number,
) => {
  const lastParams = params;
  lastParams.slice(-1)[0] = undefined;
  return Array.from(Array(count)).map((_, i) =>
    i + 1 === count
      ? createRandomMessage(...lastParams)
      : createRandomMessage(...params),
  );
};

/**
 * Description placeholder
 * @date 11/06/2023 - 16:42:31
 *
 * @returns {{ [date: string]: string; }}
 */
export const createRandomVisitedList = () => {
  const dates = faker.date.betweens(faker.date.recent(60), new Date(), 20);
  const visited: { [date: string]: string } = {};
  const url = faker.internet.url();
  dates.forEach((date) => {
    visited[date.getTime()] = `${url}/${faker.internet.domainWord()}`;
  });
  return visited;
};

/**
 * Creates a random conversation
 * @date 11/06/2023 - 16:42:31
 *
 * @param {ConversationStatus} status
 * @param {string} orgId
 * @param {string} operatorId
 * @param {string} customerId
 * @returns {EntityItem<typeof Conversation>}
 */
export const createRandomConversation = (
  status: ConversationStatus,
  orgId: string,
  operatorId: string,
  customerId: string,
): EntityItem<typeof Conversation> => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getHours() - 2);
  const conversationId = faker.datatype.uuid();
  return {
    conversationId,
    customerId,
    operatorId,
    status,
    orgId,
    channel: faker.helpers.arrayElement(conversationChannel),
    type: faker.helpers.arrayElement(conversationType),
    connectionId: faker.datatype.uuid(),
    topic: faker.helpers.arrayElement(conversationTopic),
    createdAt: faker.date.between(twoHoursAgo, now).getTime(),
    updatedAt: faker.date.between(twoHoursAgo, now).getTime(),
  };
};

/**
 * @date 11/06/2023 - 16:42:31
 *
 * @param {string} orgId
 * @returns {EntityItem<typeof Customer>}
 */
export const createRandomCustomer = (
  orgId: string,
): EntityItem<typeof Customer> => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getHours() - 2);
  const customerId = faker.datatype.uuid();
  return {
    customerId,
    orgId,
    connectionId: uuidv4(),
    mailingSubscribed: true,
    name: faker.helpers.arrayElement([faker.name.fullName(), undefined]),
    email: faker.internet.exampleEmail(),
    ip: faker.internet.ipv4(),
    profilePicture: faker.image.avatar(),
    locale: 'en-US',
    timezone: faker.address.timeZone(),
    userAgent: faker.internet.userAgent(),
    tags: faker.helpers.arrayElements(DefaultTags),
    properties: {},
    visitedPages: createRandomVisitedList(),
    phone: faker.phone.number('501-###-###'),
    createdAt: faker.date.between(twoHoursAgo, now).getTime(),
    updatedAt: now.getTime(),
  };
};

/**
 * @date 11/06/2023 - 16:42:31
 *
 * @param {string} orgId
 * @returns {EntityItem<typeof Operator>}
 */
export const createRandomOperator = (
  orgId: string,
): EntityItem<typeof Operator> => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getHours() - 2);
  const operatorId = faker.datatype.uuid();
  return {
    operatorId,
    orgId,
    connectionId: uuidv4(),
    name: faker.name.fullName(),
    profilePicture: faker.image.avatar(),
    email: faker.internet.exampleEmail(),
    createdAt: faker.date.between(twoHoursAgo, now).getTime(),
    updatedAt: now.getTime(),
  };
};
