import {
  Conversation,
  ConversationChannel,
  ConversationItem,
  ConversationStatus,
  ConversationTopic,
} from '@/entities/conversation';

import {
  ConversationOperatorView,
  ConversationState,
  DashStateDefinition,
  DashStateType,
  StateSlice,
} from './types';

/**
 * Initial chat widget state
 * @date 13/06/2023 - 11:52:13
 *
 * @type {DashStateDefinition}
 */
const initialDashState: DashStateDefinition = {
  conversationState: 'list',
  settingsState: '',
};

/**
 * Create chat widget state
 * @date 13/06/2023 - 11:52:13
 * @param {*} set
 *
 * @returns {*}
 */
export const createDashState: StateSlice<DashStateType> = (set) => ({
  ...initialDashState,
  setConversationState: (conversationState: ConversationState) =>
    set((state) => {
      state.conversationState = conversationState;
    }),
  setConversationChannel: (conversationChannel?: ConversationChannel) =>
    set((state) => {
      state.conversationChannel = conversationChannel;
    }),
  setConversationTopic: (conversationTopic?: ConversationTopic) =>
    set((state) => {
      state.conversationTopic = conversationTopic;
    }),
  setConversationOperatorView: (
    conversationOperatorView?: ConversationOperatorView
  ) =>
    set((state) => {
      state.conversationOperatorView = conversationOperatorView;
    }),
  setConversationStatus: (conversationStatus?: ConversationStatus) =>
    set((state) => {
      state.conversationOperatorView = conversationStatus;
    }),
});
