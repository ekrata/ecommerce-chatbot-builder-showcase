import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const conversationStatus = ['unassigned', 'open', 'solved'] as const;
export type ConversationStatus = (typeof conversationStatus)[number];

export const conversationChannel = [
  'live',
  'chatbot',
  'facebook',
  'whatsapp',
  'instagram',
] as const;
export type ConversationChannel = (typeof conversationChannel)[number];

export const conversationType = ['chat', 'ticket'] as const;
export type ConversationType = (typeof conversationType)[number];

export const conversationTopic = [
  'products',
  'order_status',
  'order_issues',
  'shipping_policy',
] as const;
export type ConversationTopic = (typeof conversationTopic)[number];

export const rating = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof rating)[number];

export const Conversation = new Entity({
  model: {
    entity: 'conversation',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    conversationId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      required: true,
    },
    customerId: {
      type: 'string',
      required: true,
    },
    // Current Operator
    operatorId: {
      type: 'string',
      required: true,
      default: '',
    },

    connectionId: {
      type: 'string',
    },
    type: {
      type: conversationType,
      required: true,
      readOnly: true,
    },
    channel: {
      type: conversationChannel,
      required: true,
      readOnly: true,
    },
    status: {
      type: conversationStatus,
      required: true,
    },
    rating: {
      type: 'set',
      items: rating,
    },
    topic: {
      type: conversationTopic,
    },
    createdAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
    updatedAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
      watch: '*',
      set: () => Date.now(),
    },
  },
  indexes: {
    get: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'conversationId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    listByOperator: {
      index: 'gis1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: ['orgId', 'operatorId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['updatedAt', 'status', 'channel', 'type'],
      },
    },
  },
});
