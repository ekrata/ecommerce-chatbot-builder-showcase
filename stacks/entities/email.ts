import { Entity } from 'electrodb';

export default new Entity({
  model: {
    entity: "",
    version: "1",
    service: "app",
  },
  attributes: {
    employee: {
      type: "string",
    },
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    office: {
      type: "string",
    },
    title: {
      type: "string",
    },
    team: {
      type: ["development", "marketing", "finance", "product"] as const,
    },
    salary: {
      type: "string",
    },
    manager: {
      type: "string",
    },
    dateHired: {
      type: "string",
    },
    birthday: {
      type: "string",
    },
  },
  indexes: {
    employee: {
      pk: {
        field: "pk",
        composite: ["employee"],
      },
      sk: {
        field: "sk",
        composite: [],
      },
    },
    coworkers: {
      index: "gsi1pk-gsi1sk-index",
      collection: "workplaces",
      pk: {
        field: "gsi1pk",
        composite: ["office"],
      },
      sk: {
        field: "gsi1sk",
        composite: ["team", "title", "employee"],
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