import { Entity, EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const csatQuestion = ['How was your experience?'];
export const npsQuestion = [
  'How likely are you to recommend us to a friend or colleague?',
];
/**
 * Basic Analytic Entity that stores Rich Text Format data
 * @date 12/06/2023 - 17:08:29
/**
 * Basic Analytic Entity that stores Rich Text Format data
 * @date 12/06/2023 - 17:08:29
 *
 * @type {*}
 */

export type AnalyticConversations = Required<
  Required<EntityItem<typeof Analytic>['conversations']>
>;

export type AnalyticCsat = Required<
  Required<EntityItem<typeof Analytic>['csat']>
>;

export type AnalyticNps = Required<
  Required<EntityItem<typeof Analytic>['nps']>
>;

export const analyticDuration = ['hour', 'day', 'week', 'month'] as const;
export type AnalyticDuration = (typeof analyticDuration)[number];

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
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
    },
    duration: {
      type: analyticDuration,
      default: 'hour',
    },
    startAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
    endAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
    // articles metric
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
    // conversations metric
    conversations: {
      type: 'map',
      default: {},
      properties: {
        totalCount: {
          type: 'number',
        },
        topics: {
          type: 'map',
          default: {},
          properties: {
            products: {
              type: 'number',
              required: true,
              default: 0,
            },
            orderStatus: {
              type: 'number',
              required: true,
              default: 0,
            },
            orderIssues: {
              type: 'number',
              required: true,
              default: 0,
            },
            shippingPolicy: {
              type: 'number',
              required: true,
              default: 0,
            },
          },
        },
        channels: {
          type: 'map',
          default: {},
          properties: {
            website: {
              type: 'number',
              required: true,
              default: 0,
            },
            messenger: {
              type: 'number',
              required: true,
              default: 0,
            },
            whatsapp: {
              type: 'number',
              required: true,
              default: 0,
            },
            instagram: {
              type: 'number',
              required: true,
              default: 0,
            },
            emailTicket: {
              type: 'number',
              required: true,
              default: 0,
            },
          },
        },
        status: {
          type: 'map',
          default: {},
          properties: {
            unassigned: {
              type: 'number',
              required: true,
              default: 0,
            },
            open: {
              type: 'number',
              required: true,
              default: 0,
            },
            solved: {
              type: 'number',
              required: true,
              default: 0,
            },
          },
        },
        avgWaitTime: {
          type: 'map',
          default: {},
          properties: {
            // avg time spent in unassigned
            unassignedSecondsTotal: {
              type: 'number',
              default: 0,
              required: true,
            },
            unassignedCount: {
              type: 'number',
              default: 0,
              required: true,
            },
            unassignedSecondsAvg: {
              type: 'number',
              default: 0,
              required: true,
            },
            // avg time spent in open
            openSecondsAvg: {
              type: 'number',
              default: 0,
              required: true,
            },
            openSecondsTotal: {
              type: 'number',
              default: 0,
              required: true,
            },
            openCount: {
              type: 'number',
              default: 0,
              required: true,
            },
          },
        },
      },
    },
    csat: {
      type: 'list',
      default: [],
      items: {
        type: 'map',
        default: {},
        properties: {
          question: {
            type: 'string',
            default: '',
          },
          score: {
            type: 'number',
          },
          respondents: {
            type: 'number',
          },
        },
      },
    },
    nps: {
      type: 'list',
      default: [],
      items: {
        type: 'map',
        default: {},
        properties: {
          question: {
            type: 'string',
            default: '',
          },
          score: {
            type: 'number',
          },
          respondents: {
            type: 'number',
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
    createdAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
  },
  indexes: {
    get: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'analyticId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2-pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2-sk',
        composite: ['startAt', 'endAt'],
      },
    },
  },
});
