import { Entity } from 'electrodb';
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
    createdAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
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
    customer: {
      type: 'map',
      default: {},
      properties: {
      feedback: {
        type: 'map',
        default: {},
        properties: {
          nps: {
            type: 'list',
            default: [],
            items: {
              customerQuestionRatings: {
                type: 'map',
                default: {},
                properties: {
                  customerId: {
                    type: 'string',
                  },
                  questionResponse: {
                    type: 'list',
                    default: {},
                    items: {
                      type: 'map',
                      default: {},
                      properties: {
                        question: {
                          type: csatQuestion,
                        },
                        ratings: {
                          type: 'map',
                          default: {},
                          properties: {
                            1: {
                              type: 'number',
                              default: 0,
                            },
                            2: {
                              type: 'number',
                              default: 0,
                            },
                            3: {
                              type: 'number',
                              default: 0,
                            },
                            4: {
                              type: 'number',
                              default: 0,
                            },
                            5: {
                              type: 'number',
                              default: 0,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        csat: {
          type: 'list',
          default: [],
          items: {
            customerQuestionRatings: {
              type: 'map',
              default: {},
              properties: {
                customerId: {
                  type: 'string',
                },
                longFormResponse: {
                  type: 'map',
                  property: {
                    'What was the reason for the score you gave us?': {
                      type: 'string',
                      default: 'string',
                    },
                    'What can we do better to improve your experience with our brand?':
                      {
                        type: 'string',
                        default: 'string',
                      },
                    'Did you face any challenges while shopping with us? If yes, please share what they were. ':
                      {
                        type: 'string',
                        default: 'string',
                      },
                    'What would you like for us to change about our product/service/company?':
                      {
                        type: 'string',
                        default: 'string',
                      },
                  },
                  questionResponse: {
                    type: 'list',
                    default: {},
                    items: {
                      type: 'map',
                      default: {},
                      properties: {
                        question: {
                          type: csatQuestion,
                        },
                        ratings: {
                          type: 'map',
                          default: {},
                          properties: {
                            1: {
                              type: 'number',
                              default: 0,
                            },
                            2: {
                              type: 'number',
                              default: 0,
                            },
                            3: {
                              type: 'number',
                              default: 0,
                            },
                            4: {
                              type: 'number',
                              default: 0,
                            },
                            5: {
                              type: 'number',
                              default: 0,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      }
    }
  }
    ratings: {
      type: 'map',
      default: {},
      properties: {
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
