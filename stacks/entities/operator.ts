import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const permissionType = [
  'block_permissions',
  'able_to_view',
  'able_to_edit',
] as const;
export const permissionTier = [
  'owner',
  'admin',
  'moderator',
  'operator',
] as const;

const defaultPermission = 'block_permissions';

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
    externalMetaId: {
      type: 'string',
      default: '',
    },
    connectionId: {
      type: 'string',
      default: '',
    },
    profilePicture: {
      type: 'string',
    },
    departments: {
      type: 'string',
    },
    online: {
      type: 'boolean',
      default: false,
    },
    permissionTier: {
      type: permissionTier,
      default: 'operator',
    },
    orgId: {
      type: 'string',
      readOnly: true,
      required: true,
    },
    name: {
      type: 'string',
      default: '',
    },
    email: {
      type: 'string',
      default: '',
    },
    region: {
      type: 'string',
      default: '',
    },
    language: {
      type: 'string',
      default: '',
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
      default: Date.now(),
      set: () => Date.now(),
    },
    permissions: {
      type: 'map',
      properties: {
        settings: {
          type: 'map',
          properties: {
            manageOperators: {
              type: permissionType,
              default: defaultPermission,
            },
            billing: {
              type: permissionType,
              default: defaultPermission,
            },
            projectPreferences: {
              type: permissionType,
              default: defaultPermission,
            },
            widgetAppearance: {
              type: permissionType,
              default: defaultPermission,
            },
            integrations: {
              type: permissionType,
              default: defaultPermission,
            },
            projectReports: {
              type: permissionType,
              default: defaultPermission,
            },
          },
        },
        conversationsAndContacts: {
          type: 'map',
          properties: {
            deleteContacts: {
              type: permissionType,
              default: defaultPermission,
            },
            deleteConversations: {
              type: permissionType,
              default: defaultPermission,
            },
            exportContacts: {
              type: permissionType,
              default: defaultPermission,
            },
          },
        },
        sections: {
          type: 'map',
          properties: {
            chatbots: {
              type: permissionType,
              default: defaultPermission,
            },
          },
        },
      },
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'operatorId'],
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
  },
});
