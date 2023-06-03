import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';
import { rating } from './conversation';

export const Visitor = new Entity({
  model: {
    entity: 'visitor',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    visitorId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
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
    ip: {
      type: 'string',
    },
    locale: {
      type: 'string',
      required: true,
      default: 'en',
    },
    rating: {
      type: rating,
    },
    userAgent: {
      type: 'string',
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
        composite: ['orgId', 'visitorId'],
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
        composite: [],
      },
    },
  },
});
