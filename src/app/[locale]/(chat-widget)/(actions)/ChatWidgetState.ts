import { Conversation, ConversationItem } from '@/entities/conversation';
import {
  ChatWidgetStateDefinition,
  ChatWidgetStateType,
  StateSlice,
  WidgetState,
  WidgetVisibility,
} from './types';

/**
 * Initial chat widget state
 * @date 13/06/2023 - 11:52:13
 *
 * @type {ChatWidgetStateDefinition}
 */
const initialChatWidgetState: ChatWidgetStateDefinition = {
  widgetState: 'home',
  widgetVisibility: 'minimized',
};

/**
 * Create chat widget state
 * @date 13/06/2023 - 11:52:13
 * @param {*} set
 * @returns {*}
 */
export const createChatWidgetState: StateSlice<ChatWidgetStateType> = (
  set
) => ({
  ...initialChatWidgetState,
  setWidgetState: (widgetState: WidgetState) =>
    set((state) => {
      state.chatWidget.widgetState = widgetState;
    }),
  setWidgetVisibility: (widgetVisibility: WidgetVisibility) =>
    set((state) => {
      state.chatWidget.widgetVisibility = widgetVisibility;
    }),
  setSelectedConversationId: (selectedConversationId?: string) =>
    set((state) => {
      state.chatWidget.selectedConversationId = selectedConversationId;
    }),
});
