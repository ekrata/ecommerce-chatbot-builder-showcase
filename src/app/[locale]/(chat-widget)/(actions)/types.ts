import { Configuration } from '@/entities/configuration';
import { Conversation, ConversationItem } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
import { Org } from '@/entities/org';
import { EntityItem } from 'electrodb';
import { StateCreator } from 'zustand';
import { Message } from '@/entities/message';
import { CreateCustomer, CreateMessage } from '@/entities/entities';
import { Article } from '@/entities/article';

export type WidgetState = 'help' | 'chat' | 'messages' | 'home' | 'article';
export type WidgetVisibility = 'open' | 'minimized';

export interface ChatWidgetStateDefinition {
  loading: boolean;
  org?: EntityItem<typeof Org>;
  // visitor?: EntityItem<typeof Visitor>;
  articles?: EntityItem<typeof Article>[];
  customer?: EntityItem<typeof Customer>;
  conversations: Record<string, ConversationItem>;
  configuration?: EntityItem<typeof Configuration>;
  widgetState: WidgetState;
  widgetVisibility: WidgetVisibility;
}

export interface ChatWidgetStateActions {
  /**
   * When customer starts a chat with a bot/operator 
   * @date 13/06/2023 - 12:01:04
   *
   * @type {(
      conversation: EntityItem<typeof Conversation>
    ) => Promise<void>}
   */
  createConversation: (
    conversation: EntityItem<typeof Conversation>
  ) => Promise<void>;
  /**
   * When the customer sends a message to the operator 
   * @date 13/06/2023 - 12:01:36
   *
   * @type {(
      conversationId: string,
      message: CreateMessage
    ) => Promise<void>}
   */
  sendMessage: (message: CreateMessage) => Promise<void>;
  // fetchConversations: (customerId: string) => void;
  /**
   * Fetch org.
   * @date 13/06/2023 - 12:02:29
   *
   * @type {(orgId: string) => void}
   */
  fetchOrg: (orgId: string) => void;
  /**
   * Fetches and updates operator field on a ConversationItem
   * @date 18/06/2023 - 21:18:01
   *
   * @type {(conversationId: string) => void}
   */
  fetchOperatorForConversation: (conversationId: string) => void;
  fetchConversationItems: () => Promise<void>;
  /**
   * Creates a customer through in-chat form flow.
   * @date 13/06/2023 - 12:03:29
   *
   * @type {(customer: CreateCustomer) => void}
   */
  createCustomer: (customer: CreateCustomer) => void;
  /**
   * Fetches configuration
   * @date 13/06/2023 - 12:04:07
   *
   * @type {(orgId: string) => void}
   */
  fetchConfiguration: (orgId: string) => void;
  /**
   * Sets the chat widget state
   * @date 13/06/2023 - 12:04:21
   *
   * @type {(widgetState: WidgetState) => void}
   */
  setWidgetState: (widgetState: WidgetState) => void;
  /**
   * Sets the visibility of the widget
   * @date 18/06/2023 - 21:20:11
   *
   * @type {(widgetVisibility: WidgetVisibility) => void}
   */
  setWidgetVisibility: (widgetVisibility: WidgetVisibility) => void;
}

export interface ChatWidgetStateSocketActions {
  /**
   * Handle a new message event emitted by an operator.
   * @date 13/06/2023 - 12:04:46
   *
   * @type {(message: EntityItem<typeof Message>) => void}
   */
  eventNewMessage: (message: EntityItem<typeof Message>) => void;
  /**
   * Handle a new conversation, initiated by an operator.
   * @date 13/06/2023 - 12:05:25
   *
   * @type {(conversation: EntityItem<typeof Conversation>) => void}
   */
  eventNewConversation: (conversation: EntityItem<typeof Conversation>) => void;
  /**
   * Handle a update to a conversationItem. Examples: when a new operator is assigned a conversation.
   * @date 18/06/2023 - 21:17:14
   *
   * @type {(conversationItem: ConversationItem) => void}
   */
  eventUpdateConversation: (conversationItem: ConversationItem) => void;
}

export type ChatWidgetStateType = ChatWidgetStateDefinition &
  ChatWidgetStateActions &
  ChatWidgetStateSocketActions;

export interface CombinedState {
  chatWidget: ChatWidgetStateType;
}

export type StateSlice<T> = StateCreator<
  CombinedState,
  [['zustand/immer', never]],
  [['zustand/persist', Partial<T>]],
  T
>;
