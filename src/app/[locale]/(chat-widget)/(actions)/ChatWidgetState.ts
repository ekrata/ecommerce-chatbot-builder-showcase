import { Conversation, ConversationItem } from '@/entities/conversation';
import type {
  ChatWidgetStateDefinition,
  ChatWidgetStateType,
  StateSlice,
  WidgetVisibility,
} from './types';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { CreateConversation } from '@/entities/entities';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { produce } from 'immer';

/**
 * Initial chat widget state
 * @date 13/06/2023 - 11:52:13
 *
 * @type {ChatWidgetStateDefinition}
 */
const initialChatWidgetState: ChatWidgetStateDefinition = {
  loading: false,
  conversations: {},
  widgetState: 'home',
  widgetVisibility: 'minimized',
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
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/customers/${customerId}`,
          { method: 'POST', body: JSON.stringify(customer) }
        )
      ).json();
      state.chatWidget.customer = res.data;
      state.chatWidget.loading = false;
    }),
  fetchOrg: async (orgId: string) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}`)
      ).json();
      state.chatWidget.org = res.data;
      state.chatWidget.loading = false;
    }),
  fetchArticles: async () =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/articles`
        )
      ).json();
      state.chatWidget.articles = res.data;
      state.chatWidget.loading = false;
    }),

  setWidgetState: (widgetState) =>
    set((state) => {
      state.chatWidget.widgetState = widgetState;
    }),
  setWidgetVisibility: (widgetVisibility: WidgetVisibility) => {
    set((state) => {
      state.chatWidget.widgetVisibility = widgetVisibility;
    });
  },
  sendMessage: async (message) =>
    set(async (state) => {
      const res = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/conversations/${message.conversationId}/messages/${message.messageId}`,
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
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/configuration`
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
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/conversations/${conversation.conversationId}`,
          { method: 'POST', body: JSON.stringify(Conversation) }
        )
      ).json();
      state.chatWidget.conversations[res.data.conversationId] = {
        conversation: res.data,
      };
    }),
  fetchOperatorForConversation: async (conversationId: string) =>
    set(async (state) => {
      state.chatWidget.loading = true;
      const res = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/conversation`
        )
      ).json();
      if (state.chatWidget.conversations[conversationId])
        state.chatWidget.conversations[conversationId].conversation.operator =
          res.data;
      state.chatWidget.loading = false;
    }),
  fetchConversations: async (customerId: string) =>
    set(
      produce(async (state) => {
        state.chatWidget.loading = true;
        const messageId = uuidv4();
        const res = await (
          await fetch(
            `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${state.chatWidget.org?.orgId}/conversations?customerId=${customerId}`,
            { method: 'POST', body: JSON.stringify(Conversation) }
          )
        ).json();
        state.chatWidget.conversations = (
          res.data as EntityItem<typeof Conversation>[]
        ).reduce((acc, next) => {
          return { ...acc, [next.conversationId]: next };
        }, {});
        state.chatWidget.loading = false;
      })
    ),
  fetchConversationItems: async () =>
    set(
      produce(async (state) => {
        // state.chatWidget.loading = true;
        const { orgId } = state.chatWidget.org;
        const { customerId } = state.chatWidget.customer;
        const res = await (
          await fetch(
            `${
              process.env.NEXT_PUBLIC_APP_API_URL
            }/orgs/${orgId}/conversations?customerId=${customerId}&includeMessages=true&expansionFields=${encodeURIComponent(
              JSON.stringify(['customerId', 'operatorId'])
            )}`
          )
        ).json();
        console.log(res.data);
        // state.chatWidget.loading = false;
        state.chatWidget.conversations = {
          ...(res.data as ConversationItem[]).reduce(
            (prev, curr) => ({
              ...prev,
              [curr.conversation.conversationId]: curr,
            }),
            {}
          ),
        };
      })
    ),
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
  eventUpdateConversation: async (conversationItem: ConversationItem) =>
    set(async (state) => {
      // If different or inintial operator assigned, fetch new operator
      if (
        conversationItem.conversation.operator.operatorId !==
        state.chatWidget.conversations[
          conversationItem.conversation.conversationId
        ]?.conversation.operator.operatorId
      ) {
        state.chatWidget.fetchOperatorForConversation(
          conversationItem.conversation.conversationId
        );
      }
      state.chatWidget.conversations[
        conversationItem.conversation.conversationId
      ].conversation = conversationItem.conversation;
    }),
});
