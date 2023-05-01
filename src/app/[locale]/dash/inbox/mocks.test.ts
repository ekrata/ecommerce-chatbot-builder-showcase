import { faker } from "@faker-js/faker";
import { Chat, ChatStatus, DefaultTags, Message } from "./Chat.type";

export const createRandomMessage = (
  chatId: string,
  senderId: string,
  typing = false,
  messageSentAt: Date | undefined = undefined
): Message => {
  const now = new Date();
  const twoHoursAgo = new Date()
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  const sentAt = messageSentAt ?? faker.date.between(twoHoursAgo, now);
  return {
    id: faker.datatype.uuid(),
    chatId,
    senderId,
    senderType: faker.helpers.arrayElement(['operator', 'customer']),
    sentAt,
    editedAt: faker.date.between(sentAt, now),
    updatedAt: now,
    createdAt: sentAt,
    typing,
    content: faker.lorem.paragraph(),
  };
};

export const createRandomChat = (status: ChatStatus): Chat => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getHours() - 2);
  const id = faker.datatype.uuid();
  const operatorId = faker.datatype.uuid();
  const userId = faker.datatype.uuid();
  return {
    id,
    status,
    connectionId: faker.datatype.uuid(),
    orgId: faker.datatype.uuid(),
    customer: {
      id: userId,
      name: faker.helpers.arrayElement([faker.name.fullName(), undefined]),
      email: faker.internet.exampleEmail(),
      ip: faker.internet.ipv4(),
      profilePicture: faker.image.people(),
      locale: 'en-US',
      timezone: faker.address.timeZone(),
      userAgent: faker.internet.userAgent(),
      tags: faker.helpers.arrayElements(DefaultTags),
      properties: {},
      phone: faker.phone.number('501-###-###'),
      createdAt: faker.date.between(twoHoursAgo, now),
      updatedAt: now
    },
    operators: [
      {
        id: operatorId,
        name: faker.name.fullName(),
        email: faker.internet.email(),
        profilePicture: faker.image.avatar(),
        createdAt: faker.date.between(twoHoursAgo, now),
        updatedAt: now
      },
    ],
    tags: faker.helpers.arrayElements([
      'Customer Service',
      'Sales',
      'Support',
      'Billing',
      'Order Status',
    ]),
    messages: [...Array(20)]
      .map((_, i) =>
        i === 19 ? createRandomMessage(
          id,
          faker.helpers.arrayElement([operatorId, userId]), true
        ) : createRandomMessage(
          id,
          faker.helpers.arrayElement([operatorId, userId])
        )
      )
      .sort(
        (a, b) =>
          a.sentAt.getTime() -
          b.sentAt.getTime()
      ),
    read: faker.datatype.boolean(),
    createdAt: faker.date.between(twoHoursAgo, now),
    updatedAt: faker.date.between(twoHoursAgo, now)
  };
};