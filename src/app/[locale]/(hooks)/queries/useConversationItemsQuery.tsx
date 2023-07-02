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
export const useConversationItemsQuery = (orgId: string, customerId:string) => useQuery<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], async () => (orgId && customerId) ? await getConversationItems(orgId, customerId) : [], {enabled: !!orgId && !!customerId})



/**
 * Returns sorted conversations
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem[]>}
 */
export const getConversationItems = async (
  orgId: string,
  customerId: string
): Promise<ConversationItem[]> => {
  const res = await (
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/conversations?customerId=${customerId}&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId'])
      )}`
    )
  ).json();
  sortConversationItems(res.data as ConversationItem[]);
  return res.data;
};



