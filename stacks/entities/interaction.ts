import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { nodeSubType } from './bot';

export const Interaction = new Entity({
  model: {
    entity: 'interaction',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    interactionId: {
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
    nodeSubType: {
      type: nodeSubType,
    },
    customerId: {
      type: 'string',
      default: '',
    },
    operatorId: {
      type: 'string',
      default: '',
    },
    visitId: {
      type: 'string',
      default: '',
    },
    botId: {
      type: 'string',
      default: '',
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
        composite: ['orgId', 'interactionId'],
      },
      sk: {
        field: 'sk',
        composite: ['createdAt'],
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
