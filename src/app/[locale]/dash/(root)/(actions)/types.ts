import { ConversationFilterParams } from 'packages/functions/app/api/src/conversations/listByCreatedAt';
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
  helpCenterState?: 'search' | 'list';
  conversationListFilter: ConversationFilterParams;
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
   * Sets the conversation list filter
   * @date 03/07/2023 - 11:51:29
   *
   */
  setConversationListFilter: (
    conversationListFilter?: ConversationFilterParams,
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
