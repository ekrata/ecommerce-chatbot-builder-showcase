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
    },

    connectionId: {
      type: 'string',
    },
    status: {
      type: conversationStatus,
      required: true,
    },
    channel: {
      type: conversationChannel,
      required: true,
      readOnly: true,
    },
    type: {
      type: conversationType,
      required: true,
      readOnly: true,
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
    primary: {
      pk: {
        field: 'pk',
        composite: ['conversationId'],
      },
      sk: {
        field: 'sk',
        composite: ['customerId', 'createdAt', 'updatedAt', 'type'],
      },
    },
    conversationList: {
      collection: 'conversationList',
      index: 'gsi2',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['customerId', 'createdAt', 'type'],
      },
    },
    conversationWithHistory: {
      collection: 'conversationWithHistory',
      index: 'gsi3',
      pk: {
        field: 'gsi3pk',
        composite: ['conversationId'],
      },
      sk: {
        field: 'gsi3sk',
        composite: ['customerId', 'createdAt', 'type'],
      },
    },
  },
});
