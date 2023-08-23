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
    entity: 'analytic',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    analyticId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
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
      topics: {
        type: 'map',
        default: {},
        properties: {
          products: {
            type: 'number',
            default: 0,
          },
          orderStatus: {
            type: 'number',
            default: 0,
          },
          orderIssues: {
            type: 'number',
            default: 0,
          },
          shippingPolicy: {
            type: 'number',
            default: 0,
          },
        },
        channel: {
          type: 'map',
          default: {},
          properties: {
            website: {
              type: 'number',
              default: 0,
            },
            messenger: {
              type: 'number',
              default: 0,
            },
            whatsapp: {
              type: 'number',
              default: 0,
            },
            instagram: {
              type: 'number',
              default: 0,
            },
            emailTicket: {
              type: 'number',
              default: 0,
            },
          },
        },
      },
      ratings: {
        '1': {
          type: 'number',
          default: 0,
        },
        '2': {
          type: 'number',
          default: 0,
        },
        '3': {
          type: 'number',
          default: 0,
        },
        '4': {
          type: 'number',
          default: 0,
        },
        '5': {
          type: 'number',
          default: 0,
        },
      },
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
      popularLinks: {
        type: 'list',
        items: {
          type: 'map',
          default: {},
          properties: {
            link: {
              type: 'string',
              default: '',
            },
            visits: {
              type: 'number',
              default: 0,
            },
          },
        },
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
        composite: ['analyticId'],
      },
      sk: {
        field: 'sk',
        composite: ['createdAt'],
      },
    },
  },
});
