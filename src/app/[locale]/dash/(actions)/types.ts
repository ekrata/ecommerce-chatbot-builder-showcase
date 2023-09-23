import { StateCreator } from 'zustand';

import {
  ConversationChannel,
  ConversationStatus,
  ConversationTopic,
} from '@/entities/conversation';

export type WidgetState = 'help' | 'conversations' | 'home';
export type WidgetVisibility = 'expanded' | 'open' | 'minimized';

export type ConversationState = 'search' | 'list' | 'customerInfo';
export type ConversationOperatorView = 'all' | 'bots' | string;

export interface DashStateDefinition {
  conversationState?: 'search' | 'list' | 'customerInfo';
  conversationChannel?: ConversationChannel;
  conversationStatus?: ConversationStatus;
  conversationTopic?: ConversationTopic;
  conversationOperatorView?: ConversationOperatorView;
  settingsState: '';
}

export interface DashStateActions {
  /**
   * Sets the chat widget state
   * @date 13/06/2023 - 12:04:21
   *
   * @type {(widgetState: WidgetState) => void}
   */
  setConversationState: (conversationState?: ConversationState) => void;
  /**
   * Sets the conversation list channel filter
   * @date 03/07/2023 - 11:51:29
   *
   * @type {(conversationChannel: ConversationChannel) => void}
   */
  setConversationChannel: (conversationChannel?: ConversationChannel) => void;
  /**
   * Set conversation list topic filter
   * @date 03/07/2023 - 11:51:44
   *
   * @type {(conversationTopic: ConversationTopic) => void}
   */
  setConversationTopic: (conversationTopic?: ConversationTopic) => void;
  setConversationStatus: (conversationStatus?: ConversationStatus) => void;
  /**
   * Set conversation list operator view filter 
   * @date 03/07/2023 - 11:52:05
   *
   * @type {(
      conversationOperatorView: ConversationOperatorView
    ) => void}
   */
  setConversationOperatorView: (
    conversationOperatorView?: ConversationOperatorView,
  ) => void;
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
