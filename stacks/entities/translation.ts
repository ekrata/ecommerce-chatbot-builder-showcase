import { Entity } from 'electrodb';

export const Translation = new Entity({
  model: {
    entity: 'translation',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    orgId: {
      type: 'string',
      readOnly: true,
      required: true,
    },
    lang: {
      type: 'string',
      required: true,
      readOnly: true,
    },

    translations: {
      type: 'map',
      default: {},
      required: true,
      properties: {
        chatWidget: {
          type: 'map',
          required: true,
          default: {},
          properties: {
            Name: {
              type: 'string',
              default: '',
              required: true,
            },
            'Recent message': {
              type: 'string',
              default: 'Recent message',
              required: true,
            },
            "We're online": {
              type: 'string',
              default: "We're online",
              required: true,
            },
            'Chat with us': {
              type: 'string',
              default: 'Chat with us 👋',
              required: true,
            },
            'Chat with': {
              type: 'string',
              default: 'Chat with us 👋',
              required: true,
            },
            'Replies within': {
              type: 'string',
              default: 'Replies within',
              required: true,
            },
            help: {
              type: 'string',
              default: 'help',
              required: true,
            },
            'Search for help': {
              type: 'string',
              default: 'Search for help',
              required: true,
            },
            collections: {
              type: 'string',
              default: '{count} collections',
              required: true,
            },
            'General Information': {
              type: 'string',
              default: 'General Information',
              required: true,
            },
            'Orders & Delivery': {
              type: 'string',
              default: 'Orders & Delivery',
              required: true,
            },
            'Returns & Refunds': {
              type: 'string',
              default: 'Returns & Refunds',
              required: true,
            },
            'Payments & Promotions': {
              type: 'string',
              default: 'Payments & Promotions',
              required: true,
            },
            Technical: {
              type: 'string',
              default: 'Technical',
              required: true,
            },
            Product: {
              type: 'string',
              default: 'Product',
              required: true,
            },
          },
        },
      },
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
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'lang'],
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
        composite: [],
      },
    },
    all: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: [],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['createdAt'],
      },
    },
  },
});
