import { Entity, EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';
import { Operator } from './operator';
import { Message } from './message';
import { Customer } from './customer';

/**
 * Replaces customerId and operatorId fields with their respective expanded EntityItem<T> objects
 * @date 17/06/2023 - 13:12:45
 *
 * @export
 * @typedef {ExpandedConversation}
 */
export type ExpandedConversation = EntityItem<typeof Conversation> & {
  customer: EntityItem<typeof Customer>;
  operator: EntityItem<typeof Operator>;
};

/**
 * Describes a conversation with expanded customer and operator fields.
 * Useful for rendering and accessing conversations from a list style access pattern.
 * @date 17/06/2023 - 13:14:13
 *
 * @export
 * @interface ConversationItem
 * @typedef {ConversationItem}
 */
export interface ConversationItem {
  conversation: ExpandedConversation;
  messages?: EntityItem<typeof Message>[];
}

/**
 * Contains matches against one ConversationItem for a search query.
 * @date 01/07/2023 - 20:19:11
 *
 * @export
 * @typedef {ConversationItemSearchRes}
 */
export type ConversationItemSearchRes = {
  item: ConversationItem;
  refIndex: number;
  matches: {
    indices: [number, number][];
    key: string;
    value: string;
    refIndex?: number;
  }[];
  score: number;
};

export const conversationStatus = ['unassigned', 'open', 'solved'] as const;
export type ConversationStatus = (typeof conversationStatus)[number];

export const conversationChannel = [
  'website',
  'email',
  'facebook',
  'whatsapp',
  'instagram',
] as const;
export type ConversationChannel = (typeof conversationChannel)[number];

export const conversationType = ['botChat', 'chat', 'ticket'] as const;
export type ConversationType = (typeof conversationType)[number];

export const conversationTopic = [
  'products',
  'orderStatus',
  'orderIssues',
  'shippingPolicy',
] as const;

export type ConversationTopic = (typeof conversationTopic)[number];

export const rating = ['1', '2', '3', '4', '5'] as const;
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
    },
    // Current Operator
    operatorId: {
      type: 'string',
    },
    connectionId: {
      type: 'string',
    },
    type: {
      type: conversationType,
      required: true,
    },
    channel: {
      type: conversationChannel,
      required: true,
    },
    status: {
      type: conversationStatus,
      required: true,
    },
    rating: {
      type: rating,
    },
    topic: {
      type: conversationTopic,
    },
    read: {
      type: 'boolean',
      required: true,
      default: false,
    },
    readAt: {
      type: 'number',
    },
    dismissed: {
      type: 'boolean',
      required: true,
      default: false,
    },
    archived: {
      type: 'boolean',
      required: true,
      default: false,
    },
    preventCustomerReplies: {
      type: 'boolean',
      required: true,
      default: false,
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
    assigned: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: ['orgId', 'operatorId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['updatedAt', 'status', 'channel', 'type'],
      },
    },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['updatedAt', 'status', 'channel', 'type'],
      },
    },
    byCustomer: {
      index: 'gsi3pk-gsi3sk-index',
      pk: {
        field: 'gsi3pk',
        composite: ['orgId', 'customerId'],
      },
      sk: {
        field: 'gsi3sk',
        composite: ['updatedAt', 'status', 'channel', 'type'],
      },
    },
  },
});
