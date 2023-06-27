import { Configuration } from "@/entities/configuration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "../(actions)/orgs/conversations/createConversation";
import { QueryKey } from "./queries";
import { createMessage } from "../(actions)/orgs/conversations/messages/createMessage";
import { ConversationItem } from "@/entities/conversation";
import { sortConversationItems } from "../(helpers)/sortConversationItems";

/**
 * Description placeholder
 * @date 24/06/2023 - 12:33:18
 *
 * @export
 * @enum {number}
 */
export enum MutationKey  {
  'createConversation',
  'createMessage'
}


/**
 * Creates a conversation, then shifts it onto the front of the array
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useCreateConversationMut = (orgId: string, customerId:string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: [orgId, MutationKey.createConversation],
        mutationFn: async(params: Parameters<typeof createConversation>) => await createConversation(...params),
        onSuccess: data => {
          queryClient.setQueryData([orgId, customerId, QueryKey.conversationItems], (oldData: ConversationItem[] | undefined) => [data ?? [], ...oldData ?? []])
        }
    })
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
        mutationFn: async(params: Parameters<typeof createMessage>) => await createMessage(...params),
        onSuccess: (data) => {
          queryClient.setQueryData([orgId, customerId, QueryKey.conversationItems], () => {
            const conversationItems: ConversationItem[] | undefined = queryClient.getQueryData([orgId, customerId, QueryKey.conversationItems]) 
            const oldConversationItems = conversationItems?.filter(conversationItem => conversationItem.conversation.conversationId !== conversationId) ?? []
            const conversationItem = conversationItems?.find(conversationItem => conversationItem.conversation.conversationId === conversationId)
            if(conversationItem?.conversation) {
              console.log('herez')
              const newConversationItem: ConversationItem = {...conversationItem, messages: [...(conversationItem?.messages ?? []), data]} 
              const items = [newConversationItem, ...oldConversationItems.map((item) => ({...item}))]
              sortConversationItems(items)
              console.log(items)
              return items 
            }
            return oldConversationItems
          })
        }
    })
  }

