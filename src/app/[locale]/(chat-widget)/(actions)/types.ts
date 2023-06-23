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
  widgetState: WidgetState;
  widgetVisibility: WidgetVisibility;
}

export interface ChatWidgetStateActions {
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
  ChatWidgetStateActions;

export interface CombinedState {
  chatWidget: ChatWidgetStateType;
}

export type StateSlice<T> = StateCreator<
  CombinedState,
  [['zustand/immer', never]],
  [['zustand/persist', Partial<T>]],
  T
>;
