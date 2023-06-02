import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

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
    },
    channels: {
      type: 'map',
      default: {},
      properties:{
        liveChat: {
          type: 'map',
          default: {},
          properties: {
            appearance: {
              type: 'map',
              default: {},
              properties: {
                widgetAppearance: {
                  type: 'map',
                  properties: {
                    backgroundColor: {
                      type: 'string',
                      default: 'bg-gradient-to-r from-fuchsia-300 via-violet-400 to-green-300',
                    },
                    darkBackgroundColor: {
                      type: 'string',
                      default: 'bg-gradient-to-r from-fuchsia-600 via-violet-700 to-green-500',
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
