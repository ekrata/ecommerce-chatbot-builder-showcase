import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const Customer = new Entity({
  model: {
    entity: 'customer',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    customerId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    name: {
      type: 'string',
    },
    email: {
      type: 'string',
      required: true,
    },
    profilePicture: {
      type: 'string',
    },
    mailingSubscribed: {
      type: 'boolean',
      default: false,
      required: true,
    },
    ip: {
      type: 'string',
    },
    locale: {
      type: 'string',
      required: true,
      default: 'en',
    },
    phone: {
      type: 'string',
    },
    starRating: {
      type: 'set',
      items: [1, 2, 3, 4, 5] as const,
    },
    userAgent: {
      type: 'string',
    },
    tags: {
      type: 'string',
    },
    properties: {
      type: 'map',
      properties: {
        key: {
          type: 'string',
        },
        value: {
          type: 'string',
        },
      },
    },
    visitedPages: {
      type: 'map',
      properties: {
        datetimeAtVist: {
          type: 'number',
        },
        value: {
          type: 'string',
        },
      },
    },
    timezone: {
      type: 'string',
    },
    notes: {
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
      watch: '*',
      default: Date.now(),
      set: () => Date.now(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['customerId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    customer: {
      collection: 'conversationList',
      index: 'gsi2',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['customerId', 'createdAt'],
      },
    },
  },
});
