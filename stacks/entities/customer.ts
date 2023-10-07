import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { rating } from './conversation';

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
    metaSenderId: {
      type: 'string',
      required: true,
    },
    connectionId: {
      type: 'string',
      required: true,
      default: '',
    },
    name: {
      type: 'string',
    },
    email: {
      type: 'string',
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
    timezone: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    rating: {
      type: rating,
    },
    userAgent: {
      type: 'string',
    },
    tags: {
      type: 'set',
      items: 'string',
    },
    online: {
      type: 'boolean',
      default: false,
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
    notes: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
      default: Date.now(),
    },
    updatedAt: {
      type: 'number',
      watch: '*',
      default: Date.now(),
      set: () => Date.now(),
    },
    lastVisitAt: {
      type: 'number',
      default: Date.now(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'customerId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOrg: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt'],
      },
    },
  },
});
