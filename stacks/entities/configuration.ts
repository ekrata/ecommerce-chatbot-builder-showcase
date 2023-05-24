import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const widgetPosition = ['left', 'right'] as const;
export type WidgetPosition = (typeof widgetPosition)[number];

export const showOnDevices = ['both', 'only mobile', 'only desktop'];

export const Configuration = new Entity({
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
    channels: {
      type: 'map',
      properties: {
        liveChat: {
          type: 'map',
          properties: {
            appearance: {
              type: 'map',
              properties: {
                widgetAppearance: {
                  type: 'map',
                  properties: {
                    backgroundColor: {
                      type: 'string',
                      default: '',
                    },
                    onlineStatus: {
                      type: 'string',
                      default: 'We reply immediately',
                    },
                    widgetPosition: {
                      type: widgetPosition,
                      default: 'right',
                    },
                    enableButtonLabel: {
                      type: 'boolean',
                      default: false,
                    },
                    labelText: {
                      type: 'string',
                      default: 'Chat with us &#128075;',
                    },
                    enableWidgetSounds: {
                      type: 'boolean',
                      default: true,
                    },
                    brandLogo: {
                      type: 'string',
                      default: '',
                    },
                  },
                },
                getStarted: {
                  type: 'map',
                  properties: {
                    status: {
                      type: 'string',
                      default: 'Hi there 👋',
                    },
                    message: {
                      type: 'string',
                      default: 'Welcome to our website. Ask us anything 🎉',
                    },
                    backgroundLink: {
                      type: 'string',
                      default: '',
                    },
                  },
                },
                mobileWidget: {
                  type: 'map',
                  properties: {
                    buttonPosition: {
                      type: widgetPosition,
                      default: 'right',
                    },
                    buttonSize: {
                      type: showOnDevices,
                      default: 'both',
                    },
                  },
                },
              },
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
        composite: ['orgId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    all: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: [],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt'],
      },
    },
  },
});
