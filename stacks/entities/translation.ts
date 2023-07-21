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
        dash: {
          type: 'map',
          required: true,
          default: {},
          properties: {
            conversations: {
              type: 'string',
              default: `{count, plural, 
              =0 {No conversations found}
              =1 {One conversation}
              other {# conversations}
              }`,
            },
            'Start chat': {
              type: 'string',
              default: 'Start chat',
            },
            'All conversations': {
              type: 'string',
              default: 'All conversations',
            },
            'Bots in action': {
              type: 'string',
              default: 'Bots in action',
            },
            You: {
              type: 'string',
              default: 'You',
            },
            Name: {
              type: 'string',
              default: 'Name',
            },
            Entered: {
              type: 'string',
              default: 'Entered',
            },
            'Last Visited Page': {
              type: 'string',
              default: 'Last Visited Page',
            },
            tickets: {
              type: 'string',
              default: `{count, plural, 
              =0 {No tickets found}
              =1 {One ticket}
              other {# tickets}
              }`,
            },
            at: {
              type: 'string',
              default: 'at',
            },
          },
        },
        chatWidget: {
          type: 'map',
          required: true,
          default: {},
          properties: {
            Name: {
              type: 'string',
              default: 'Staff',
              required: true,
            },
            orgName: {
              type: 'string',
              default: 'Gymshark',
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
            'We typically reply in under': {
              type: 'string',
              default: 'We typically reply in under',
              required: true,
            },
            Messages: {
              type: 'string',
              default: 'Messages',
            },
            'Send us a message': {
              type: 'string',
              default: 'Send us a message',
              required: true,
            },
            'just now': {
              type: 'string',
              default: 'just now',
              required: true,
            },
            Bot: {
              type: 'string',
              default: 'Bot',
              required: true,
            },
            You: {
              type: 'string',
              default: 'You',
              required: true,
            },
            Help: {
              type: 'string',
              default: 'Help',
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
            articles: {
              type: 'string',
              default: `{count, plural, 
              =0 {No articles found}
              =1 {One article}
              other {# articles}
            }`,
            },
            categories: {
              type: 'string',
              default: `{count, plural, 
              =0 {No categories found}
              =1 {One category}
              other {# categories}
              }`,
            },
            'No results for': {
              type: 'string',
              default: 'No results for',
              required: true,
            },
            'Try again': {
              type: 'string',
              default: 'Try again',
              required: true,
            },
            Updated: {
              type: 'string',
              default: 'Updated',
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
