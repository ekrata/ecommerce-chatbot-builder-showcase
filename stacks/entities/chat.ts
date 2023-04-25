import { Entity } from 'electrodb';

export default new Entity({
  model: {
    entity: "chat",
    version: "1",
    service: "app",
  },
  attributes: {
    chatId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    status: {
      type: ['Unassigned', 'Active', 'Solved', 'Timeouts']
    },
    type: {
      type: ["live", "chatbot", "facebook", "whatsapp", "instagram"] as const,
    },
    externalId: {
      type: 'string'
    }
  },
  indexes: {
    chat: {
      pk: {
        field: "pk",
        composite: ["chatId"],
      },
      sk: {
        field: "sk",
        composite: [],
      },
    },

    teams: {
      index: "gsi2pk-gsi2sk-index",
      pk: {
        field: "gsi2pk",
        composite: ["team"],
      },
      sk: {
        field: "gsi2sk",
        composite: ["title", "salary", "employee"],
      },
    },
    employeeLookup: {
      collection: "assignments",
      index: "gsi3pk-gsi3sk-index",
      pk: {
        field: "gsi3pk",
        composite: ["employee"],
      },
      sk: {
        field: "gsi3sk",
        composite: [],
      },
    },
    roles: {
      index: "gsi4pk-gsi4sk-index",
      pk: {
        field: "gsi4pk",
        composite: ["title"],
      },
      sk: {
        field: "gsi4sk",
        composite: ["salary", "employee"],
      },
    },
    directReports: {
      index: "gsi5pk-gsi5sk-index",
      pk: {
        field: "gsi5pk",
        composite: ["manager"],
      },
      sk: {
        field: "gsi5sk",
        composite: ["team", "office", "employee"],
      },
    },
  }
});