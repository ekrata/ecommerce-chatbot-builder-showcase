import { Entity, EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { Customer } from './customer';

/**
 * Expands the customer field of a visit.
 * @date 17/07/2023 - 10:56:12
 *
 * @export
 * @typedef {ExpandedVisit}
 */
export type ExpandedVisit = EntityItem<typeof Visit> & {
  customer: EntityItem<typeof Customer>;
};

export const Visit = new Entity({
  model: {
    entity: 'visit',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    visitId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    customerId: {
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
    url: {
      type: 'string',
      required: true,
    },
    at: {
      type: 'number',
      required: true,
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
        composite: ['orgId', 'visitId'],
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
        composite: ['at'],
      },
    },
    byCustomerId: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId', 'customerId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['at'],
      },
    },
  },
});
