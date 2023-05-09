import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const Operator = new Entity({
  model: {
    entity: 'operator',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    operatorId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      readOnly: true,
      required: true,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    screenName: {
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
      set: () => Date.now(),
    },
  },
  indexes: {
    operator: {
      pk: {
        field: 'pk',
        composite: ['operatorId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    org: {
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
    operators: {
      collection: 'conversationList',
      index: 'gsi2',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['operatorId'],
      },
    },
  },
});
