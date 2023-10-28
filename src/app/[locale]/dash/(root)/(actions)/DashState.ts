import { ConversationFilterParams } from '@/packages/functions/app/api/src/conversations/listByCreatedAt';

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
  conversationListFilter: {
    orgId: '',
    cursor: '',
    customerId: '',
    operatorId: 'all',
    expansionFields: ['customerId', 'operatorId'],
  },
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
  setConversationState: (conversationState?: ConversationState) =>
    set((state) => {
      state.conversationState = conversationState;
      return state;
    }),
  setConversationListFilter: (
    conversationListFilter?: ConversationFilterParams,
  ) =>
    set((state) => {
      state.conversationListFilter = {
        ...state.conversationListFilter,
        ...conversationListFilter,
      };
      return state;
    }),
});
