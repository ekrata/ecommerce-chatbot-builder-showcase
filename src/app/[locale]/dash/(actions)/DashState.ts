import { Conversation, ConversationItem } from '@/entities/conversation';
import {
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
});
