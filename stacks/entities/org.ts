import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const orgPlanTier = ['free', 'starter', 'scale', 'plus'] as const;
export type OrgPlanTier = (typeof orgPlanTier)[number];

export const Org = new Entity({
  model: {
    entity: 'org',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    name: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    planTier: {
      type: orgPlanTier,
      required: true,
      default: 'free',
    },
    planOperatorSeats: {
      type: 'number',
      required: true,
      default: 1,
    },
    planChatbotConversations: {
      type: 'number',
      required: true,
      default: 50,
    },
    billingCustomerId: {
      type: 'string',
    },
    billingSubscriptionId: {
      type: 'string',
    },
    domain: {
      type: 'string',
      default: '',
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
        composite: ['orgId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    all: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: [],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt'],
      },
    },
  },
});
