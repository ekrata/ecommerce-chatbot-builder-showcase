import { ConversationItem, ExpandedConversation } from '@/entities/conversation';
import { CreateConversation } from '@/entities/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const createConversation = async (
  orgId: string,
  conversationId: string,
  body: CreateConversation
): Promise<ConversationItem> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return {
    conversation: (await res.json()) as ExpandedConversation,
    messages: [],
  };
};


/**
 * Adds a new conversation item 
 * @date 21/07/2023 - 10:59:11
 *
 * @param {ConversationItem} newConversationItem
 * @param {ConversationItem[]} conversationItems
 * @returns {*}
 */
export const newConversationItemReducer = (newConversationItem: ConversationItem, conversationItems: ConversationItem[]) => {
  const { conversationId } = newConversationItem.conversation
  // remove duplicates just in case?
  const oldConversationItems = conversationItems?.filter(conversationItem => conversationItem.conversation.conversationId !== conversationId) ?? []
  const newConversationItems = [...oldConversationItems, newConversationItem]
  sortConversationItems(newConversationItems)
  return newConversationItems
}

/**
 * Creates a message, 
 * then assigns the new message response
 * to the end of the conversationItem's messages array. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} customerId
 * @param {string} conversationId
 * @returns {*}
 */
export const useCreateConversationMut = (orgId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.createConversation],
    mutationFn: async (params: Parameters<typeof createConversation>) => await createConversation(...params),
    onSuccess: (newConversation) => {
      queryClient.setQueryData<ConversationItem[]>([orgId, MutationKey.createConversation], (oldData) => newConversationItemReducer(newConversation, oldData ?? []))
    }
  })
}