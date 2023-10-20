import { Entity, EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

export const widgetPosition = ['left', 'right'] as const;
export type WidgetPosition = (typeof widgetPosition)[number];

export const deviceVisibility = [
  'On both desktop and mobile devices',
  'Only on desktop devices',
  'Only on mobile devices',
] as const;

export type DeviceVisibility = (typeof deviceVisibility)[number];

export const buttonSize = ['small', 'medium', 'large'] as const;
export type ButtonSize = (typeof buttonSize)[number];

export const sendFrom = [
  'Ekrata domain',
  'Own domain',
  'Own email address',
] as const;
export type SendFrom = (typeof sendFrom)[number];

// Hacky, but it allows us to break down the type used on each page of the front end settings config
type ConfigChannels = EntityItem<typeof Configuration>['channels'];
type ConfigLiveChat = NonNullable<ConfigChannels>['liveChat'];

export type ConfigLiveChatAppearance = NonNullable<
  NonNullable<ConfigLiveChat>['appearance']
>;

export type WidgetAppearance = NonNullable<
  NonNullable<ConfigLiveChatAppearance>['widgetAppearance']
>;

export type ConfigTicketing = NonNullable<
  NonNullable<ConfigChannels>['ticketing']
>;
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
    },
    channels: {
      type: 'map',
      default: {},
      properties: {
        ticketing: {
          type: 'map',
          default: {},
          properties: {
            forwardingEmail: {
              type: 'string',
              default: 'default@noreply.echat.ekrata.com',
            },
            emails: {
              type: 'list',
              default: [],
              items: {
                type: 'string',
              },
            },
            sendFrom: {
              type: sendFrom,
              default: 'Ekrata domain',
            },
          },
        },
        liveChat: {
          type: 'map',
          default: {},
          properties: {
            installation: {
              type: 'map',
              default: {},
              properties: {
                installed: {
                  type: 'boolean',
                  default: false,
                },
                jsInstallUrl: {
                  type: 'string',
                  default: '',
                },
              },
            },
            appearance: {
              type: 'map',
              default: {},
              properties: {
                widgetAppearance: {
                  type: 'map',
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
                    widgetPosition: {
                      type: widgetPosition,
                      default: 'right',
                    },
                    enableButtonLabel: {
                      type: 'boolean',
                      default: false,
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
                widgetVisibility: {
                  type: 'map',
                  default: {},
                  properties: {
                    displayWidget: {
                      type: widgetPosition,
                      default: 'right',
                    },
                    devices: {
                      type: deviceVisibility,
                      default: deviceVisibility[0],
                    },
                    displayTheChatWhenOffline: {
                      type: 'boolean',
                      default: true,
                    },
                    letVisitorsCreateATicketWhenOffline: {
                      type: 'boolean',
                      default: true,
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
                      type: buttonSize,
                      default: 'medium',
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
