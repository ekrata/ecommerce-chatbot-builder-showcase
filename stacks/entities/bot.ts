import { Entity } from 'electrodb';
import {
  Action,
  Condition,
  OperatorInteractionTrigger,
  ShopifyAction,
  ShopifyCondition,
  VisitorBotInteractionTrigger,
  VisitorPageInteractionTrigger,
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { v4 as uuidv4 } from 'uuid';

export const nodeType = ['trigger', 'condition', 'action'] as const;

export const nodeSubType = [
  ...Object.keys(VisitorBotInteractionTrigger),
  ...Object.keys(VisitorPageInteractionTrigger),
  ...Object.keys(OperatorInteractionTrigger),
  ...Object.keys(Condition),
  ...Object.keys(ShopifyCondition),
  ...Object.keys(Action),
  ...Object.keys(ShopifyAction),
] as const;

export const Bot = new Entity({
  model: {
    entity: 'bot',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    botId: {
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
    executedCount: {
      type: 'number',
    },
    helpfulnessPercent: {
      type: 'number',
    },
    handoffPercent: {
      type: 'number',
    },
    active: {
      type: 'boolean',
    },
    nodes: {
      type: 'list',
      default: [],
      items: {
        type: 'map',
        properties: {
          id: {
            type: 'string',
          },
          nodeType: {
            type: nodeType,
          },
          nodeSubType: {
            type: nodeSubType,
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
        composite: ['orgId', 'botId'],
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
