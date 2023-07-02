import { ConversationItem } from "@/entities/conversation";
import { QueryKey } from "../queries";
import { useQuery } from "@tanstack/react-query";
import { sortConversationItems } from '../../(helpers)/sortConversationItems';

/**
 * Returns conversationItems query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useConversationItemsQuery = (orgId: string, conversationId: string) => useQuery<ConversationItem[]>([orgId, conversationId, QueryKey.conversationItem], async () => (orgId && conversationId) ? await getConversationItem(orgId, conversationId) : undefined, {enabled: !!orgId && !!conversationId})



/**
 * Returns sorted conversations
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem[]>}
 */
export const getConversationItem = async (
  orgId: string,
  conversationId: string
): Promise<ConversationItem[]> => {
  const res = await (
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/conversations/${conversationId}?&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId'])
      )}`
    )
  ).json();
  sortConversationItems(res.data as ConversationItem[]);
  return res.data;
};



