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
import { ChatWidgetStateDefinition } from '../../(actions)/types';

export type WidgetState = 'help' | 'conversations' | 'home';
export type WidgetVisibility = 'expanded' | 'open' | 'minimized';

export type ConversationState = 'search' | 'list' | 'customerInfo';

export interface DashStateDefinition {
  conversationState: 'search' | 'list' | 'customerInfo';
  settingsState: '';
}

export interface DashStateActions {
  /**
   * Sets the chat widget state
   * @date 13/06/2023 - 12:04:21
   *
   * @type {(widgetState: WidgetState) => void}
   */
  setConversationState: (conversationState: ConversationState) => void;
}
//   setConversationId: (widgetState: WidgetState) => void;
//   /**
//    * Sets the visibility of the widget
//    * @date 18/06/2023 - 21:20:11
//    *
//    * @type {(widgetVisibility: WidgetVisibility) => void}
//    */
//   setWidgetVisibility: (widgetVisibility: WidgetVisibility) => void;
//   /**
//    * Sets the current conversation id, which toggles between the chat and conversations screen.
//    * @date 24/06/2023 - 13:32:41
//    *
//    * @type {(selectedConversationId: string) => void}
//    */
//   setSelectedConversationId: (selectedConversationId?: string) => void;
//   /**
//    * Sets the current article id, which toggles between the help and the article screen.
//    * @date 24/06/2023 - 13:32:41
//    *
//    * @type {(selectedConversationId: string) => void}
//    */
//   setSelectedArticleId: (selectedArticleId?: string) => void;
// }

export type DashStateType = DashStateDefinition & DashStateActions;

export type StateSlice<T> = StateCreator<
  DashStateType,
  [['zustand/immer', never]],
  [['zustand/persist', Partial<T>]],
  T
>;
