import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Messages have multiple contexts; default is messages,
 * other contexts such as prompts may trigger the chatbot to send a input form.
 * @date 12/06/2023 - 11:19:18
 *
 * @type {readonly ["message", "email-prompt", "question-prompt", "order-number-prompt", "name-prompt"]}
 */
export const contextType = [
  'message',
  'email-prompt',
  'question-prompt',
  'order-number-prompt',
  'name-prompt',
] as const;

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
    context: {
      type: contextType,
      default: 'message',
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
      required: true,
      readOnly: true,
    },
    sentAt: {
      type: 'number',
      default: Date.now(),
    },
    seenAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
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
