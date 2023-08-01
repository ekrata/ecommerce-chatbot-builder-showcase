import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

/**
 * Basic Article Entity that stores Rich Text Format data
 * @date 12/06/2023 - 17:08:29
 *
 * @type {*}
 */
export const Analytic = new Entity({
  model: {
    entity: 'article',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    createdAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
    orgId: {
      type: 'string',
      required: true,
    },
    articles: {
      type: 'map',
      default: {},
      properties: {
        views: {
          type: 'number',
          default: 0,
        },
        avgRating: {
          type: 'number',
          default: 0,
        },
      },
    },
  },
  conversations: {
    type: 'map',
    default: {},
    properties: {
      new: {
        type: 'number',
        default: 0,
      },
      unassigned: {
        type: 'number',
        default: 0,
      },
      open: {
        type: 'number',
        default: 0,
      },
      solved: {
        type: 'number',
        default: 0,
      },
      // time it takes for conversation to go from unassigned to assigned
      avgWaitTime: {
        type: 'number',
        default: 0,
      },
      avgRating: {
        type: 'number',
        default: 0,
      },
    },
  },
  visitors: {
    type: 'map',
    default: {},
    properties: {
      new: {
        type: 'number',
        default: 0,
      },
      returning: {
        type: 'number',
        default: 0,
      },
    },
  },
  updatedAt: {
    type: 'number',
    readOnly: true,
    default: Date.now(),
    watch: '*',
    set: () => Date.now(),
  },
  indexes: {
    get: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'articleId', 'lang'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId', 'lang'],
      },
      sk: {
        field: 'gsi2sk',
        composite: [],
      },
    },
  },
});
