import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const widgetPosition = ['left', 'right'] as const;
export type WidgetPosition = (typeof widgetPosition)[number];

export const showOnDevices = ['both', 'only mobile', 'only desktop'];

export const Configuration = new Entity({
  model: {
    entity: 'configuration',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    orgId: {
      type: 'string',
      readOnly: true,
      required: true,
    },
    channels: {
      type: 'map',
      default: {},
      properties: {
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
                  default: {},
                  properties: {
                    logo: {
                      type: 'string',
                      default:
                        'https://upload.wikimedia.org/wikipedia/commons/c/c5/Gymshark_logo.svg',
                    },
                    botLogo: {
                      type: 'string',
                      default:
                        'https://seeklogo.com/images/G/gymshark-logo-3F1E7A14A4-seeklogo.com.png',
                    },
                    backgroundColor: {
                      type: 'string',
                      default:
                        'linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))',
                    },
                    darkBackgroundColor: {
                      type: 'string',
                      default:
                        'linear-gradient(to right, rgb(14, 165, 233), rgb(107, 33, 168), rgb(21, 128, 61))',
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
                  },
                },
                getStarted: {
                  type: 'map',
                  default: {},
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
                  default: {},
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
