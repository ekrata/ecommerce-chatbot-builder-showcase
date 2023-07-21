import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    createMessage
} from '../../(chat-widget)/(actions)/orgs/conversations/messages/createMessage';
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
export const newMessageReducer = (newMessage: EntityItem<typeof Message>, conversationItems: ConversationItem[]) => {
  const { conversationId } = newMessage
  const oldConversationItems = conversationItems?.filter(conversationItem => conversationItem.conversation.conversationId !== conversationId) ?? []
  const conversationItem = conversationItems?.find(conversationItem => conversationItem.conversation.conversationId === conversationId)
  if (conversationItem?.conversation) {
    const newConversationItem: ConversationItem = { ...conversationItem, messages: [...(conversationItem?.messages ?? []), newMessage] }
    const items = [newConversationItem, ...oldConversationItems.map((item) => ({ ...item }))]
    sortConversationItems(items)
    return items
  }
  return oldConversationItems
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
export const useCreateMessageMut = (orgId: string, customerId: string, conversationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.createMessage],
    mutationFn: async (params: Parameters<typeof createMessage>) => await createMessage(...params),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], (oldData) => newMessageReducer(newMessage, oldData ?? []))
    }
  })
}