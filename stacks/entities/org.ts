import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const Org = new Entity({
  model: {
    entity: 'org',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    name: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    billingCustomerId: {
      type: 'string',
    },
    billingSubscriptionId: {
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
      default: Date.now(),
      watch: '*',
      set: () => Date.now(),
    },
  },
  indexes: {
    organisations: {
      pk: {
        field: 'pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'sk',
        composite: ['name'],
      },
    },
  },
});
