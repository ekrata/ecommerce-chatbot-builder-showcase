import { Configuration } from "@/entities/configuration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "../(actions)/orgs/conversations/createConversation";
import { QueryKey } from "./queries";
import { createMessage } from "../(actions)/orgs/conversations/messages/createMessage";
import { ConversationItem } from "@/entities/conversation";
import { sortConversationItems } from "../(helpers)/sortConversationItems";
import { createCustomer } from "../(chat-widget)/actions";

/**
 * Description placeholder
 * @date 24/06/2023 - 12:33:18
 *
 * @export
 * @enum {number}
 */
export enum MutationKey  {
  'createConversation',
  'createMessage',
  'createCustomer',
}


/**
 * Creates a conversation, then shifts it onto the front of the array
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useCreateConversationMut = (orgId: string, customerId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: [orgId, MutationKey.createConversation],
        mutationFn: async(params: Parameters<typeof createConversation>) => await createConversation(...params),
        onSuccess: data => {
          queryClient.setQueryData([orgId, customerId, QueryKey.conversationItems], (oldData: ConversationItem[] | undefined) => [data ?? [], ...oldData ?? []])
        }
    })
  }






