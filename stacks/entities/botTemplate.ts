import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { botCategory, nodeSubType } from './bot';

export const BotTemplate = new Entity({
  model: {
    entity: 'botTemplate',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    botTemplateId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    name: {
      type: 'string',
    },
    useCount: {
      type: 'number',
      default: 0,
    },
    active: {
      type: 'boolean',
    },
    category: {
      type: botCategory,
      default: '',
    },
    startWhenAnotherBotRunning: {
      type: 'boolean',
      default: false,
    },
    startWhileAnOperatorIsHandlingAnotherConversation: {
      type: 'boolean',
      default: false,
    },
    startWhileOperatorsAreOffline: {
      type: 'boolean',
      default: false,
    },
    viewport: {
      type: 'map',
      default: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      required: true,
      properties: {
        x: {
          type: 'number',
          default: 0,
          required: true,
        },
        y: {
          type: 'number',
          default: 0,
          required: true,
        },
        zoom: {
          type: 'number',
          default: 1,
          required: true,
        },
      },
    },
    nodes: {
      type: 'list',
      default: [],
      items: {
        type: 'map',
        properties: {
          id: {
            type: 'string',
            default: '',
          },
          type: {
            type: nodeSubType,
            default: '',
          },
          position: {
            type: 'map',
            properties: {
              x: {
                type: 'number',
              },
              y: {
                type: 'number',
              },
            },
            default: { x: 0, y: 0 },
          },
          retries: {
            type: 'number',
            default: 0,
          },
          // getters and setters allow us to keep the node data as stringified JSON only at database level
          data: {
            type: 'string',
            default: '{}',
          },
        },
      },
    },
    edges: {
      type: 'list',
      default: [],
      items: {
        type: 'map',
        properties: {
          id: {
            type: 'string',
          },
          source: {
            type: 'string',
          },
          target: {
            type: 'string',
          },
          sourceHandle: {
            type: 'string',
            set: (val) => {
              console.log(val);
              if (val === null) {
                return '';
              } else {
                return val;
              }
            },
          },
          targetHandle: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          data: {
            type: 'string',
            default: '{}',
          },
        },
      },
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
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['botTemplateId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
  },
});
