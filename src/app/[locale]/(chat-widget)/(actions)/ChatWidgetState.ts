import { Conversation } from '@/entities/conversation';
import type {
  ChatWidgetStateDefinition,
  ChatWidgetStateType,
  ConversationItem,
  StateSlice,
} from './types';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { CreateConversation } from '@/entities/entities';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';

/**
 * Initial chat widget state
 * @date 13/06/2023 - 11:52:13
 *
 * @type {ChatWidgetStateDefinition}
 */
const initialChatWidgetState: ChatWidgetStateDefinition = {
  loading: false,
  conversations: {},
  widgetState: 'minimized',
};

/**
 * Create chat widget state
 * @date 13/06/2023 - 11:52:13
 *
 * @param {*} set
 * @returns {*}
 */
export const createChatWidgetState: StateSlice<ChatWidgetStateType> = (
  set
) => ({
  ...initialChatWidgetState,
  createCustomer: async (customer) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const customerId = uuidv4();
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/customers/${customerId}`,
          { method: 'POST', body: JSON.stringify(customer) }
        )
      ).json();
      state.chatWidget.customer = res.data;
      state.chatWidget.loading = false;
    }),
  fetchOrg: async (orgId: string) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (await fetch(`${Api.appApi.url}/orgs/${orgId}`)).json();
      state.chatWidget.org = res.data;
      state.chatWidget.loading = false;
    }),
  fetchArticles: async () =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/articles`
        )
      ).json();
      state.chatWidget.articles = res.data;
      state.chatWidget.loading = false;
    }),

  setWidgetState: (widgetState) =>
    set((state) => {
      state.chatWidget.widgetState = widgetState;
    }),
  sendMessage: async (message) =>
    set(async (state) => {
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/conversations/${message.conversationId}/messages/${message.messageId}`,
          { method: 'POST', body: JSON.stringify(message) }
        )
      ).json();
      state.chatWidget.conversations[message.conversationId].messages?.push(
        res.data
      );
    }),
  fetchConfiguration: async (configuration) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/configuration`
        )
      ).json();
      state.chatWidget.configuration = res.data;
      state.chatWidget.loading = false;
    }),
  createConversation: async (conversation: CreateConversation) =>
    set(async (state) => {
      const messageId = uuidv4();
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/conversations/${conversation.conversationId}`,
          { method: 'POST', body: JSON.stringify(Conversation) }
        )
      ).json();
      state.chatWidget.conversations[res.data.conversationId] = {
        conversation: res.data,
      };
    }),
  fetchOperatorForConversation: async (
    conversation: EntityItem<typeof Conversation>
  ) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/conversation`
        )
      ).json();
      if (state.chatWidget.conversations[conversation.conversationId])
        state.chatWidget.conversations[conversation.conversationId].operator =
          res.data;
      state.chatWidget.loading = false;
    }),
  fetchConversations: async (customerId: string) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const messageId = uuidv4();
      const res = await (
        await fetch(
          `${Api.appApi.url}/orgs/${state.chatWidget.org?.orgId}/conversations?customerId=${customerId}`,
          { method: 'POST', body: JSON.stringify(Conversation) }
        )
      ).json();
      state.chatWidget.conversations = (
        res.data as EntityItem<typeof Conversation>[]
      ).reduce((acc, next) => {
        return { ...acc, [next.conversationId]: next };
      }, {});
      state.chatWidget.loading = false;
    }),
  eventNewConversation: async (conversation: EntityItem<typeof Conversation>) =>
    set(async (state) => {
      state.chatWidget.conversations[conversation.conversationId] = {
        ...state.chatWidget.conversations[conversation.conversationId],
      };
    }),
  eventNewMessage: async (message: EntityItem<typeof Message>) =>
    set(async (state) => {
      state.chatWidget.conversations?.[message.conversationId]?.messages?.push(
        message
      );
    }),
  eventUpdateConversation: async (
    conversation: EntityItem<typeof Conversation>
  ) =>
    set(async (state) => {
      // If different or inintial operator assigned, fetch new operator
      if (
        conversation.operatorId !==
        state.chatWidget.conversations[conversation.conversationId]
          ?.conversation.operatorId
      ) {
        state.chatWidget.fetchOperatorForConversation(conversation);
      }
      state.chatWidget.conversations[conversation.conversationId].conversation =
        conversation;
    }),
});
