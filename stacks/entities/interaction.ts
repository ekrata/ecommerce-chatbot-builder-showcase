import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { Triggers } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

import { nodeSubType } from './bot';
import { conversationChannel, conversationStatus } from './conversation';

export const Interaction = new Entity({
  model: {
    entity: 'interaction',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    interactionId: {
      type: 'string',
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    type: {
      type: Object.values(Triggers),
    },
    customerId: {
      type: 'string',
      default: '',
      required: true,
      readOnly: true,
    },
    // set if interaction occurs during a conversation
    conversationId: {
      type: 'string',
      default: '',
      required: true,
      readOnly: true,
    },
    // set if interaction involves a operator
    operatorId: {
      type: 'string',
      default: '',
      required: true,
      readOnly: true,
    },
    // set if interaction involves a visitor
    visitId: {
      type: 'string',
      default: '',
      required: true,
      readOnly: true,
    },
    // set if interaction involves a bot
    botId: {
      type: 'string',
      default: '',
      required: true,
      readOnly: true,
    },
    channel: {
      type: conversationChannel,
      default: '',
      required: true,
      readOnly: true,
    },
    status: {
      type: conversationStatus,
      default: '',
      required: true,
      readOnly: true,
    },
    createdAt: {
      type: 'number',
      // we require the interaction source client to pass in the createdAt. This is because it is part of the composite index.
      // if creating an interaction fails or is sent twice, this will allow for idempotency when combined with upsert.
      // default: Date.now(),
      // set: () => Date.now(),
      required: true,
      readOnly: true,
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
    composite: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: [
          'orgId',
          'botId',
          'customerId',
          'operatorId',
          'visitId',
          'operatorId',
          'conversationId',
          'createdAt',
          'channel',
          'status',
          'type',
        ],
      },
      sk: {
        field: 'gsi2sk',
        composite: [],
      },
    },
  },
});
