import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const orgPlanTier = ['starter', 'plus'] as const;
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
    metaPageId: {
      type: 'string',
      default: '',
    },
    whatsappPhoneId: {
      type: 'string',
    },
    isWidgetDown: {
      type: 'boolean',
      default: true,
    },
    billingSubscriptionId: {
      type: 'string',
      default: '',
    },
    billingMonthlyCycleStartTimestamp: {
      type: 'number',
      default: 0,
    },
    billingQuota: {
      type: 'map',
      properties: {
        seats: {
          type: 'number',
          default: 0,
        },
        triggers: {
          type: 'number',
          default: 0,
        },
      },
      default: {},
    },
    billingRemainingQuota: {
      type: 'map',
      properties: {
        seats: {
          type: 'number',
          default: 0,
        },
        triggers: {
          type: 'number',
          default: 0,
        },
      },
    },
    name: {
      type: 'string',
      required: true,
      default: '',
    },
    email: {
      type: 'string',
    },
    planTier: {
      type: orgPlanTier,
      required: true,
      default: 'free',
    },
    helpCenterEnabled: {
      type: 'boolean',
      default: false,
    },
    chatbotEnabled: {
      type: 'boolean',
      default: false,
    },
    planOperatorSeats: {
      type: 'number',
      required: true,
      default: 1,
    },
    averageUnassignedWaitTime: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          startDayTime: {
            type: 'number',
          },
          averageWaitTime: {
            type: 'number',
          },
        },
      },
    },
    averageOpenWaitTime: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          startDayTime: {
            type: 'number',
          },
          averageWaitTime: {
            type: 'number',
          },
        },
      },
    },
    planChatbotConversations: {
      type: 'number',
      required: true,
      default: 50,
    },
    billingCustomerId: {
      type: 'string',
    },
    domain: {
      type: 'string',
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
    whatsappId: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['whatsappPhoneId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['createdAt'],
      },
    },
  },
});
