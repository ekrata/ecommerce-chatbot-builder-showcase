import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { UpdateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

/**
 * adds a new message to the specific conversationItem.  
 * @date 28/06/2023 - 09:53:40
 *
 * @param {EntityItem<typeof Message>} newMessage
 * @param {ConversationItem[]} conversationItems
 * @returns {*}
 */
export const updateMessageReducer = (updatedMessage: EntityItem<typeof Message>, conversationItems: ConversationItem[]) => {
  const { conversationId } = updatedMessage
  console.log(conversationItems)
  const oldConversationItems = conversationItems?.filter(conversationItem => conversationItem?.conversationId !== conversationId) ?? []
  const conversationItem = conversationItems?.find(conversationItem => conversationItem?.conversationId === conversationId)

  if (conversationItem?.conversationId) {
    const newConversationItem: ConversationItem = { ...conversationItem, messages: [...(conversationItem?.messages ?? []), updatedMessage] }
    const items = [newConversationItem, ...oldConversationItems]
    sortConversationItems(items)
    return items
  }
  return oldConversationItems
}


export const updateMessage = async (
  orgId: string,
  conversationId: string,
  messageId: string,
  body: UpdateMessage,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};


/**
 * Updates a message, 
 * then assigns the new message response
 * to the end of the conversationItem's messages array. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} customerId
 * @param {string} conversationId
 * @returns {*}
 */
export const useUpdateMessageMut = (orgId: string, customerId: string, conversationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.createMessage],
    mutationFn: async (params: Parameters<typeof updateMessage>) => await updateMessage(...params),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], (oldData) => updateMessageReducer(newMessage, oldData ?? []))
    }
  })
}
