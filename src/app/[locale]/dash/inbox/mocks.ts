import { faker } from "@faker-js/faker";
import { Chat, ChatStatus, Message } from "./ChatListPanel";

export const createRandomMessage = (
  chatId: string,
  senderId: string
): Message => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getUTCHours() - 2);
  twoHoursAgo.setHours(now.getUTCHours() - 2);
  const sentAt = faker.date.between(now, twoHoursAgo);
  return {
    id: faker.datatype.uuid(),
    chatId,
    senderId,
    senderType: faker.helpers.arrayElement(['operator', 'customer']),
    sentAt: sentAt.getTime.toString(),
    editedAt: faker.date.between(now, sentAt).getTime().toString(),
    content: faker.lorem.paragraph(),
  };
};

export const createRandomChat = (status: ChatStatus): Chat => {
  const now = new Date();
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(now.getUTCHours() - 2);
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
      name: faker.name.fullName(),
      email: faker.internet.email(),
      profilePicture: faker.image.avatar(),
    },
    operators: [
      {
        id: operatorId,
        name: faker.name.fullName(),
        email: faker.internet.email(),
        profilePicture: faker.image.avatar(),
      },
    ],
    tags: faker.helpers.arrayElements([
      'Customer Service',
      'Sales',
      'Support',
      'Billing',
      'Order Status',
    ]),
    messages: Array(20)
      .map(() =>
        createRandomMessage(
          id,
          faker.helpers.arrayElement([operatorId, userId])
        )
      )
      .sort(
        (a, b) =>
          new Date(parseInt(a.sentAt, 10)).getTime() -
          new Date(parseInt(b.sentAt, 10)).getTime()
      ),
    createdAt: faker.date.between(now, twoHoursAgo).getTime().toString(),
    updatedAt: faker.date.between(now, twoHoursAgo).getTime().toString(),
  };
};