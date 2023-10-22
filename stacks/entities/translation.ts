import { Entity, EntityItem } from 'electrodb';

export type ChatWidgetTranslations = NonNullable<
  EntityItem<typeof Translation>
>['translations']['chatWidget'];
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
            'Welcome! 👋': {
              type: 'string',
              default: 'Welcome! 👋',
            },
            'How can we help you?': {
              type: 'string',
              default: 'How can we help you? ',
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
            Email: {
              type: 'string',
              default: 'Email',
            },

            at: {
              type: 'string',
              default: 'at',
            },
            Article: {
              type: 'string',
              default: 'Article',
            },
            Title: {
              type: 'string',
              default: 'Title',
            },
            Download: {
              type: 'string',
              default: 'Download',
            },
            Subtitle: {
              type: 'string',
              default: 'Subtitle',
            },
            Category: {
              type: 'string',
              default: 'Category',
            },
            Status: {
              type: 'string',
              default: 'Status',
            },
            Create: {
              type: 'string',
              default: 'Create',
            },
            'Delete article': {
              type: 'string',
              default: 'Delete article',
            },
            'Copy to clipboard': {
              type: 'string',
              default: 'Delete article',
            },
            'Copied to clipboard': {
              type: 'string',
              default: 'Copied to clipboard',
            },
            Remove: {
              type: 'string',
              default: 'Remove',
            },
            Save: {
              type: 'string',
              default: 'Save',
            },
            Back: {
              type: 'string',
              default: 'Back',
            },
            Next: {
              type: 'string',
              default: 'Next',
            },
            Done: {
              type: 'string',
              default: 'Done',
            },
            Region: {
              type: 'string',
              default: 'Region',
            },
            Language: {
              type: 'string',
              default: 'Region',
            },
            Desktop: {
              type: 'string',
              default: 'Desktop',
            },
            Mobile: {
              type: 'string',
              default: 'Mobile',
            },
            Message: {
              type: 'string',
              default: 'Message',
            },
            'Code snippet': {
              type: 'string',
              default: 'Code snippet',
            },
            'Need more help?': {
              type: 'string',
              default: 'Need more help?',
            },
            'Visit our Knowledge base': {
              type: 'string',
              default: 'Visit our Knowledge base',
            },
            'The help screen, articles and our in-built CMS is only available to + users.':
              {
                type: 'string',
                default:
                  'The help screen, articles and our in-built CMS is only available to + users.',
              },
            settings: {
              type: 'map',
              default: {},
              properties: {
                appearance: {
                  type: 'map',
                  default: {},
                  properties: {
                    Appearance: {
                      type: 'string',
                      default: 'Appearance',
                    },
                    'Widget Appearance': {
                      type: 'string',
                      default: 'Widget Appearance',
                    },
                    'Background Color': {
                      type: 'string',
                      default: 'Background Color',
                    },
                    'Welcome Image': {
                      type: 'string',
                      default: 'Welcome Image',
                    },
                    'Online Status': {
                      type: 'string',
                      default: 'Online Status',
                    },
                    'Widget Position': {
                      type: 'string',
                      default: 'Widget Position',
                    },
                    'Show Button Label': {
                      type: 'string',
                      default: 'Button Label',
                    },
                    'Label Text': {
                      type: 'string',
                      default: 'Label Text',
                    },
                    'Enable widget sounds': {
                      type: 'string',
                      default: 'Enable widget sounds',
                    },
                    Left: {
                      type: 'string',
                      default: 'Left',
                    },
                    Right: {
                      type: 'string',
                      default: 'Right',
                    },
                    'Brand Logo': {
                      type: 'string',
                      default: 'Brand Logo',
                    },
                    'Custom branding in widget and emails': {
                      type: 'string',
                      default: 'Custom branding in widget and emails',
                    },
                    'Custom branding is available on the Plus plan': {
                      type: 'string',
                      default: 'Custom branding is available on the Plus plan',
                    },
                    'Widget Visibility': {
                      type: 'string',
                      default: 'Widget Visibility',
                    },
                    Devices: {
                      type: 'string',
                      default: 'Devices',
                    },
                    'Mobile Widget': {
                      type: 'string',
                      default: 'Mobile Widget',
                    },
                    'Button Position': {
                      type: 'string',
                      default: 'Button Position',
                    },
                    'Button Size': {
                      type: 'string',
                      default: 'Button Size',
                    },
                    small: {
                      type: 'string',
                      default: 'small',
                    },
                    medium: {
                      type: 'string',
                      default: 'medium',
                    },
                    large: {
                      type: 'string',
                      default: 'large',
                    },
                    'On both desktop and mobile devices': {
                      type: 'string',
                      default: 'On both desktop and mobile devices',
                    },
                    'Only on desktop devices': {
                      type: 'string',
                      default: 'Only on desktop devices',
                    },
                    'Only on mobile devices': {
                      type: 'string',
                      default: 'Only on mobile devices',
                    },
                    'Hide on specific pages': {
                      type: 'string',
                      default: 'Hide on specific pages',
                    },
                    "Display the Chat When You're Offline": {
                      type: 'string',
                      default: "Display the Chat When You're Offline",
                    },
                    'Display Widget': {
                      type: 'string',
                      default: 'Display Widget',
                    },
                    'Let visitors create a Ticket when you’re offline': {
                      type: 'string',
                      default: "Display the Chat When You're Offline",
                    },
                    'Offline Status': {
                      type: 'string',
                      default: 'Offline Status',
                    },
                    'adjust online hours': {
                      type: 'string',
                      default: 'adjust online hours',
                    },
                    'Get Started': {
                      type: 'string',
                      default: 'Get Started',
                    },
                    'Offline Message': {
                      type: 'string',
                      default: 'Offline Message',
                    },
                  },
                },
                sidebar: {
                  type: 'map',
                  default: {},
                  properties: {
                    Sidebar: {
                      type: 'string',
                      default: 'Sidebar',
                    },
                    Enable: {
                      type: 'string',
                      default: 'Enable',
                    },
                  },
                },
                translations: {
                  type: 'map',
                  default: {},
                  properties: {
                    Translations: {
                      type: 'string',
                      default: 'Translations',
                    },
                    Multilanguage: {
                      type: 'string',
                      default: 'Multilanguage',
                    },
                    'Add as many languages as you want and let your customers use the widget in the language they have set up for their browser.':
                      {
                        type: 'string',
                        default:
                          'Add as many languages as you want and let your customers use the widget in the language they have set up for their browser.',
                      },
                    'Delete language': {
                      type: 'string',
                      default: 'Delete language',
                    },
                  },
                },
                installation: {
                  type: 'map',
                  default: {},
                  properties: {
                    Installation: {
                      type: 'string',
                      default: 'Installation',
                    },
                    'The chat code is not installed properly': {
                      type: 'string',
                      default: 'The chat code is not installed properly',
                    },
                    'The chat code is installed': {
                      type: 'string',
                      default: 'The chat code is installed',
                    },
                    'Paste this code snippet just before the </body> tag.': {
                      type: 'string',
                      default:
                        'Paste this code snippet just before the </body> tag.',
                    },
                    'Provide your Shopify domain to connect with eChat': {
                      type: 'string',
                      default:
                        'Provide your Shopify domain to connect with eChat',
                    },
                    'Copy to clipboard': {
                      type: 'string',
                      default: 'Copy to clipboard',
                    },
                    'Your store name': {
                      type: 'string',
                      default: 'Your store name',
                    },
                    'Connect to': {
                      type: 'string',
                      default: 'Connect to',
                    },
                    'Wordpress installation instructions': {
                      type: 'string',
                      default: `Log in to your WordPress account and go to Dashboard
                      Navigate to the “Plugins” section and select “Add New”.
                      Type “eChat” in the search bar and hit the “Install New” button
                      Once installed, make sure to hit the “Activate” button before moving on
                      Click “eChat Chat” in the left-hand side menu. Choose “Log in” and enter your email and password
                      Choose the project you want to integrate with your website
                      You’re all set! Hit “Open eChat Panel” to start using live chat & chatbots`,
                    },
                  },
                },
                Ticketing: {
                  type: 'map',
                  default: {},
                  properties: {
                    Ticketing: {
                      type: 'string',
                      default: 'Ticketing',
                    },
                    'Connecting email': {
                      type: 'string',
                      default: 'Connecting email',
                    },
                    'Connect new email': {
                      type: 'string',
                      default: 'Connect new email',
                    },
                    'Keep sending tickets from Tidio domain or start using your own email address to improve your credibility and increase the deliverability.':
                      {
                        type: 'string',
                        default:
                          'Keep sending tickets from Tidio domain or start using your own email address to improve your credibility and increase the deliverability.',
                      },
                    'Send from': {
                      type: 'string',
                      default:
                        'Paste this code snippet just before the </body> tag.',
                    },
                    'Sender address': {
                      type: 'string',
                      default: 'Sender address',
                    },
                    'Automatic response': {
                      type: 'string',
                      default: 'Automatic response',
                    },
                    'Custom email signauture': {
                      type: 'string',
                      default: 'Custom email signature',
                    },
                    'Filtered emails': {
                      type: 'string',
                      default: 'Filtered emails',
                    },
                    'Add new email filter': {
                      type: 'string',
                      default: 'Add new email filter',
                    },
                    Own: {
                      type: 'string',
                      default:
                        'Paste this code snippet just before the </body> tag.',
                    },
                    Domain: {
                      type: 'string',
                      default:
                        'Paste this code snippet just before the </body> tag.',
                    },
                    'Connect with your existing email': {
                      type: 'string',
                      default: 'Connect with your existing email',
                    },
                    'Create a new email address': {
                      type: 'string',
                      default: 'Create a new email address',
                    },
                    'Email address': {
                      type: 'string',
                      default: 'Email address',
                    },
                    'Choose email type': {
                      type: 'string',
                      default: 'Choose email type',
                    },
                    'Choose provider': {
                      type: 'string',
                      default: 'Choose provider',
                    },
                    'Follow email instructions': {
                      type: 'string',
                      default: 'Follow email instructions',
                    },
                    'Other email provider': {
                      type: 'string',
                      default: 'Other email provider',
                    },
                    'Email type': {
                      type: 'string',
                      default: 'Email type',
                    },
                    'You can connect your existing mailbox or create a new one with a eChat domain':
                      {
                        type: 'string',
                        default:
                          'You can connect your existing mailbox or create a new one with a eChat domain.',
                      },
                    Alias: {
                      type: 'string',
                      default: 'Alias',
                    },
                    'Other mailbox provider': {
                      type: 'string',
                      default: 'Other mailbox provider',
                    },
                    'Set up an automatic reply that customers will receive when they create a ticket.':
                      {
                        type: 'string',
                        default:
                          'Set up an automatic reply that customers will receive when they create a ticket.',
                      },
                    "List of filtered out emails from which you won't receive any tickets":
                      {
                        type: 'string',
                        default: `List of filtered out emails from which you won’t receive any tickets.`,
                      },
                    google: {
                      type: 'map',
                      default: {},
                      properties: {
                        'Select the Gear icon from the top right corner of your Google mail dashboard and choose Settings':
                          {
                            type: 'string',
                            default:
                              'Select the Gear icon from the top right corner of your Google mail dashboard and choose Settings',
                          },
                        "Choose the 'Forwarding and POP/IMAP' tab in the settings and click on the 'Add a forwarding address' button in the middle":
                          {
                            type: 'string',
                            default: `Choose the "Forwarding and POP/IMAP" tab in the settings and click on the "Add a forwarding address" button in the middle`,
                          },
                        "Copy the following email address and paste it in the 'Please enter a new forwarding email address:' field and click on the 'Next button'":
                          {
                            type: 'string',
                            default:
                              "Copy the following email address and paste it in the 'Please enter a new forwarding email address:' field and click on the 'Next button'",
                          },
                        "Please wait for a confirmation email and click on the Verification link to activate the forwarding Also, make sure that you have selected the 'Forward a copy of incoming mail to' checkbox in your Forwarding settings in Gmail":
                          {
                            type: 'string',
                            default:
                              "Please wait for a confirmation email and click on the Verification link to activate the forwarding. Also, make sure that you have selected the 'Forward a copy of incoming mail to...' checkbox in your Forwarding settings in Gmail",
                          },
                      },
                    },
                    microsoft: {
                      type: 'map',
                      default: {},
                      properties: {
                        "Select the Gear icon from the top right corner of your Inbox and choose 'Options'":
                          {
                            type: 'string',
                            default:
                              "Select the Gear icon from the top right corner of your Inbox and choose 'Options'",
                          },
                        "From the Options page, click on 'Forwarding' tab in 'Account' section":
                          {
                            type: 'string',
                            default:
                              "Select the Gear icon from the top right corner of your Inbox and choose 'Options'",
                          },
                        "Copy the following email address and paste it in the 'Forward my email to:' field and click on the 'Save' button":
                          {
                            type: 'string',
                            default:
                              "Copy the following email address and paste it in the 'Forward my email to:' field and click on the 'Save' button",
                          },
                      },
                    },
                    other: {
                      type: 'map',
                      default: {},
                      properties: {
                        'To integrate your mailbox, set up automatic forwarding in your current email, to the email address below':
                          {
                            type: 'string',
                            default:
                              'To integrate your mailbox, set up automatic forwarding in your current email, to the email address below',
                          },
                        'if you need any help': {
                          type: 'string',
                          default: 'if you need any help',
                        },
                        'click here to read the webmail integration guides': {
                          type: 'string',
                          default:
                            'click here to read the webmail integration guides',
                        },
                      },
                    },
                  },
                },
                Account: {
                  type: 'map',
                  default: {},
                  properties: {
                    Account: {
                      type: 'string',
                      default: 'Account',
                    },
                    'Personal Details': {
                      type: 'string',
                      default: 'Personal details',
                    },
                    'Your picture': {
                      type: 'string',
                      default: 'Your picture',
                    },
                    Name: {
                      type: 'string',
                      default: 'Name',
                    },

                    Region: {
                      type: 'string',
                      default: 'Region',
                    },
                    Language: {
                      type: 'string',
                      default: 'Language',
                    },
                  },
                },
                customerSatisfaction: {
                  type: 'map',
                  default: {},
                  properties: {
                    'Customer satisfaction': {
                      type: 'string',
                      default: 'Customer satisfaction',
                    },
                    'If you want to measure the level of your customer satisfaction, you can enable an automated survey that allows them to rate and comment on their experience. It will be shown whenever an operator closes a conversation. You will be able to check results in the Analytics section.':
                      {
                        type: 'string',
                        default:
                          'If you want to measure the level of your customer satisfaction, you can enable an automated survey that allows them to rate and comment on their experience. It will be shown whenever an operator closes a conversation. You will be able to check results in the Analytics section.',
                      },
                    'A customer can rate and comment on a conversation by clicking on the three dots icon even though an automated survey is disabled.':
                      {
                        type: 'string',
                        default:
                          'A customer can rate and comment on a conversation by clicking on the three dots icon even though an automated survey is disabled.',
                      },
                    'Automated survey': {
                      type: 'string',
                      default: 'Automated survey',
                    },
                    'Message about rating': {
                      type: 'string',
                      default: 'Message about rating',
                    },
                    'How would you rate your experience talking to us today?': {
                      type: 'string',
                      default:
                        'How would you rate your experience talking to us today?',
                    },
                    'Additional comment': {
                      type: 'string',
                      default: 'Additional comment',
                    },
                    'Share your feedback for this rating': {
                      type: 'string',
                      default: 'Share your feedback for this rating',
                    },
                  },
                },
                operatingHours: {
                  type: 'map',
                  default: {},
                  properties: {
                    'Operating Hours': {
                      type: 'string',
                      default: 'Operating Hours',
                    },
                    'Set a schedule when you are available to receive new messages, so it will automatically change your online/offline status':
                      {
                        type: 'string',
                        default:
                          'Set a schedule when you are available to receive new messages, so it will automatically change your online/offline status.',
                      },
                    'Operating hours are enabled': {
                      type: 'string',
                      default: 'Operating hours are enabled',
                    },
                    'Operating hours are disabled': {
                      type: 'string',
                      default: 'Operating hours are disabled',
                    },
                    'When all operators are offline, chat widget will be seen as offline. You can decide how it should behave in':
                      {
                        type: 'string',
                        default:
                          'When all operators are offline, chat widget will be seen as offline. You can decide how it should behave in',
                      },
                  },
                },
                Operators: {
                  type: 'map',
                  default: {},
                  properties: {
                    Operators: {
                      type: 'string',
                      default: 'Operators',
                    },
                    'Add an operator': {
                      type: 'string',
                      default: 'Add an operator',
                    },
                    Role: {
                      type: 'string',
                      default: 'Role',
                    },
                    'Resend invitation': {
                      type: 'string',
                      default: 'Resend Invitation',
                    },
                    'Edit permissions': {
                      type: 'string',
                      default: 'Edit permissions',
                    },
                  },
                },
                'Chat Page': {
                  type: 'string',
                  default: 'Chat Page',
                },
                Translations: {
                  type: 'string',
                  default: 'Translations',
                },
                Instagram: {
                  type: 'string',
                  default: 'Instagram',
                },
                'Live Chat': {
                  type: 'string',
                  default: 'Live Chat',
                },
                Channels: {
                  type: 'string',
                  default: 'Channels',
                },
                Personal: {
                  type: 'string',
                  default: 'Personal',
                },
                General: {
                  type: 'string',
                  default: 'General',
                },
                Notifications: {
                  type: 'string',
                  default: 'Notifications',
                },
                'Canned Responses': {
                  type: 'string',
                  default: 'Canned Responses',
                },
                Workflow: {
                  type: 'string',
                  default: 'Workflow',
                },
                Team: {
                  type: 'string',
                  default: 'Team',
                },
                'Email Marketing': {
                  type: 'string',
                  default: 'Email Marketing',
                },
                Integrations: {
                  type: 'string',
                  default: 'Integrations',
                },
                'Desktop & Mobile': {
                  type: 'map',
                  default: {},
                  properties: {
                    'Desktop & Mobile': {
                      type: 'string',
                      default: 'Desktop & Mobile',
                    },
                    'Download our mobile app and stay in touch with your customers on the go.':
                      {
                        type: 'string',
                        default:
                          'Download our mobile app and stay in touch with your customers on the go.',
                      },
                    'Download desktop app to use the chat whenever you are on your computer. You don’t need to keep your browser open to stay online.':
                      {
                        type: 'string',
                        default:
                          'Download desktop app to use the chat whenever you are on your computer. You don’t need to keep your browser open to stay online.',
                      },
                  },
                },
                'Contact Properties': {
                  type: 'string',
                  default: 'Contact Properties',
                },
                'Project & Billing': {
                  type: 'string',
                  default: 'Project & Billing',
                },
                Domains: {
                  type: 'string',
                  default: 'Domains',
                },
                Tracking: {
                  type: 'string',
                  default: 'Domains',
                },
              },
            },
            articleCategory: {
              type: 'map',
              default: {},
              properties: {
                'General Information': {
                  type: 'string',
                  default: 'General Information',
                },
                'Orders & Delivery': {
                  type: 'string',
                  default: 'Orders & Delivery',
                },
                'Returns & Refunds': {
                  type: 'string',
                  default: 'Returns & Refunds',
                },
                'Payments & Promotions': {
                  type: 'string',
                  default: 'Payments & Promotions',
                },
                Technical: {
                  type: 'string',
                  default: 'Technical',
                },
                Product: {
                  type: 'string',
                  default: 'Product',
                },
              },
            },
            articleStatus: {
              type: 'map',
              default: {},
              properties: {
                Published: {
                  type: 'string',
                  default: 'Published',
                },
                Draft: {
                  type: 'string',
                  default: 'Draft',
                },
                'In Review': {
                  type: 'string',
                  default: 'In Review',
                },
              },
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
