import { Entity, EntityItem } from 'electrodb';
import {
    Action, Condition, OperatorInteractionTrigger, ShopifyAction, ShopifyCondition,
    VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { v4 as uuidv4 } from 'uuid';

export const nodeType = ['trigger', 'condition', 'action'] as const;

export const triggers = [
  ...Object.values(VisitorBotInteractionTrigger),
  ...Object.values(VisitorPageInteractionTrigger),
  ...Object.values(OperatorInteractionTrigger),
] as const;

export type Triggers = (typeof triggers)[number];

export const conditions = [
  ...Object.values(Condition),
  ...Object.values(ShopifyCondition),
] as const;

export type Conditions = (typeof conditions)[number];

export const actions = [
  ...Object.values(Action),
  ...Object.values(ShopifyAction),
];

export type Actions = (typeof actions)[number];

export const nodeSubType = [...triggers, ...conditions, ...actions] as const;

export const botCategory = [
  'General',
  'Sales',
  'Customer Service',
  'Order issues',
  'Lead generation',
  'Marketing',
  'Promotions',
] as const;

export type BotCategory = (typeof botCategory)[number];

export type BotNodeType = NonNullable<EntityItem<typeof Bot>['nodes']>[0];
export type BotEdgeType = NonNullable<EntityItem<typeof Bot>['edges']>[0];

export const validationType = [
  'None',
  'Name',
  'Email',
  'Number',
  'Phone Number',
  'URL',
] as const;

export type ValidationType = (typeof validationType)[number];

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
    triggeredCount: {
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