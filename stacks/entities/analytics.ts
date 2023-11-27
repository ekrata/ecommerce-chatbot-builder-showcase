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

export type AnalyticConversations = NonNullable<
  NonNullable<EntityItem<typeof Analytic>['conversations']>
>;

// type ConfigLiveChat = NonNullable<ConfigChannels>['liveChat'];

// export type ConfigLiveChatAppearance = NonNullable<
//   NonNullable<ConfigLiveChat>['appearance']
// >;

// export type WidgetAppearance = NonNullable<
//   NonNullable<ConfigLiveChatAppearance>['widgetAppearance']
// >;

// export type ConfigTicketing = NonNullable<
//   NonNullable<ConfigChannels>['ticketing']
// >;

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
        },
        channels: {
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
        status: {
          type: 'map',
          default: {},
          properties: {
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
            },
            unassignedCount: {
              type: 'number',
              default: 0,
            },
            unassignedSecondsAvg: {
              type: 'number',
              default: 0,
            },
            // avg time spent in open
            openSecondsAvg: {
              type: 'number',
              default: 0,
            },
            openSecondsTotal: {
              type: 'number',
              default: 0,
            },
            openCount: {
              type: 'number',
              default: 0,
            },
          },
        },
      },
    },
    nps: {
      type: 'number',
    },
    csat: {
      type: 'number',
    },
    // visitorMetrics
    // visitors: {
    //   type: 'map',
    //   default: {},
    //   properties: {
    //     new: {
    //       type: 'number',
    //       default: 0,
    //     },
    //     returning: {
    //       type: 'number',
    //       default: 0,
    //     },
    //     vistedUrlsFreq: {
    //       type: 'list',
    //       items: {
    //         type: 'map',
    //         default: {},
    //         properties: {
    //           url: {
    //             type: 'string',
    //             default: '',
    //           },
    //           visits: {
    //             type: 'number',
    //             default: 0,
    //           },
    //           avg: {
    //             type: 'number',
    //             default: 0,
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
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
        composite: [],
      },
    },
  },
});
