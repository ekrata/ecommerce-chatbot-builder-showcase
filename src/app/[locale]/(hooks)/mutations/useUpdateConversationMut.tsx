import { EntityItem } from 'electrodb';
import { partition } from 'lodash';

import { Conversation, ConversationItem, ExpandedConversation } from '@/entities/conversation';
import { UpdateConversation, UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDashStore } from '../../dash/(root)/(actions)/useDashStore';
import { useAuthContext } from '../AuthProvider';
import { MutationKey } from '../mutations';

export const updateConversation = async (
  orgId: string,
  conversationId: string,
  body: UpdateConversation
): Promise<EntityItem<typeof Operator>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};


const updateConversationReducer = (conversations: ConversationItem[], updatedConversation: EntityItem<typeof Conversation>) => {
  // split into updatedConversation and the rest
  const [oldConversationUpdated, oldConversations] = partition(conversations, ((conversation) => conversation?.conversationId === updatedConversation?.conversationId))
  const oldConversation = oldConversationUpdated?.[0]
  // we also got the update operator obj and customer obj incase the update changed the operatorId/customerId
  return {
    ...oldConversations, ...{ ...oldConversation, ...updatedConversation, messages: oldConversation?.messages } as ConversationItem
  }
}

/**
 * Creates an operator, and sets the operator session state 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} operatorId
 * @returns {*}
 */
export const useUpdateConversationMut = (orgId: string, conversationId: string) => {
  const { conversationListFilter } = useDashStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, conversationId, MutationKey.updateConversation],
    mutationFn: async (params: Parameters<typeof updateConversation>) => await updateConversation(...params),
    onSuccess: async (updatedConversation) => {
      const conversations = queryClient.getQueryData([...Object.values(conversationListFilter)]) as ConversationItem[]
      updateConversationReducer(conversations, updatedConversation as ExpandedConversation)
    }
  })

}

