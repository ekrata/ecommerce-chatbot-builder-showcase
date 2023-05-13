import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const messageSender = ['operator', 'customer'] as const;
export type MessageSender = (typeof messageSender)[number];

export const Message = new Entity({
  model: {
    entity: 'message',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    messageId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    conversationId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    operatorId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    customerId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    sender: {
      type: messageSender,
      required: true,
      readOnly: true,
    },
    content: {
      type: 'string',
      required: true,
    },
    sentAt: {
      type: 'number',
      required: true,
      readOnly: true,
    },
    editedAt: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
      required: true,
      readOnly: true,
      default: Date.now(),
    },
    updatedAt: {
      type: 'number',
      readOnly: true,
      watch: '*',
      default: Date.now(),
      set: () => Date.now(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'conversationId', 'messageId'],
      },
      sk: {
        field: 'sk',
        composite: ['sentAt'],
      },
    },
  },
});
