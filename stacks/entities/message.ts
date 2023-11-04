import { CustomAttributeType, Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';
import { string } from 'zod';

import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { DecisionButtonsData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionButtons';
import { DecisionCardMessagesData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionCardMessages';
import { DecisionQuickRepliesData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionQuickReplies';

import { botNodeEvent } from './bot';

/**
 * Type of sender
 * @date 12/06/2023 - 10:43:10
 *
 * @type {readonly ["operator", "customer"]}
 */
export const senderType = ['operator', 'customer', 'bot'] as const;
/**
 * senderType as a union
 * @date 12/06/2023 - 10:43:10
 *
 * @export
 * @typedef {SenderType}
 */
export type SenderType = (typeof senderType)[number];

// /**
//  * Messages have multiple contexts; default is messages,
//  * other contexts such as prompts may trigger the chatbot to send a input form.
//  * @date 12/06/2023 - 11:19:18
//  *
//  * @type {readonly ["message", "email-prompt", "question-prompt", "order-number-prompt", "name-prompt"]}
//  */
// export const contextType = [
//   'message',
//   'email-prompt',
//   'question-prompt',
//   'order-number-prompt',
//   'name-prompt',
// ] as const;

export const messageFormType = [
  '',
  botNodeEvent.AskAQuestion,
  botNodeEvent.DecisionButtons,
  botNodeEvent.DecisionCardMessages,
  botNodeEvent.DecisionQuickReplies,
  // botNodeEvent.SendAForm,
] as const;

export type MessageFormType = (typeof messageFormType)[number];

export type NodeFormData =
  | AskAQuestionData
  | DecisionQuickRepliesData
  | DecisionButtonsData
  | DecisionCardMessagesData;

export const attachmentType = [
  'image',
  'video',
  'audio',
  'file',
  'template',
] as const;

export type AttachmentType = (typeof attachmentType)[number];

export const fallbackAttachment = {};

export interface Template {
  product: {
    elements: object[];
  };
}
/**
 * Entity that describes a message sent during a conversation.
 * @date 12/06/2023 - 10:43:10
 *
 * @type {*}
 */
export const Message = new Entity({
  model: {
    entity: 'message',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    messageId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    externalMetaId: {
      type: 'string',
      default: '',
    },
    conversationId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    operatorId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    customerId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    sender: {
      type: senderType,
      required: true,
      readOnly: true,
    },
    content: {
      type: 'string',
      default: '',
    },
    contentHtml: {
      type: 'string',
    },
    messageFormType: {
      type: messageFormType,
      default: '',
    },
    messageFormData: {
      type: 'string',
      default: '{}',
    },
    selectedEdgeLabel: {
      type: 'string',
      default: '',
    },
    botStateContext: {
      type: 'string',
      default: '',
    },
    sentAt: {
      type: 'number',
      default: Date.now(),
    },
    seenAt: {
      type: 'number',
      default: Date.now(),
    },
    replyToMessageId: {
      type: 'string',
      default: '',
    },
    message: {
      type: 'map',
      properties: {},
    },
    attachments: {
      type: 'list',
      items: {
        type: 'string',
        properties: {
          type: {
            type: attachmentType,
            default: '',
          },
          payload: {
            type: 'map',
            properties: {
              url: {
                type: 'string',
                default: '',
              },
              title: {
                type: 'string',
                default: '',
              },
              product: {
                elements: {
                  type: 'list',
                  default: [{}],
                },
              },
            },
          },
        },
      },
    },
    referralProductId: {
      type: 'string',
      default: '',
    },
    createdAt: {
      type: 'number',
      required: true,
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
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'conversationId', 'messageId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byConversation: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: ['orgId', 'conversationId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['sentAt'],
      },
    },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['sentAt'],
      },
    },
    byOrgConversation: {
      index: 'gsi3pk-gsi3sk-index',
      pk: {
        field: 'gsi3pk',
        composite: ['orgId', 'conversationId'],
      },
      sk: {
        field: 'gsi3sk',
        composite: ['sentAt'],
      },
    },
  },
});
