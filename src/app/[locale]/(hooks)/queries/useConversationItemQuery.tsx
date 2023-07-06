import { ConversationItem } from '@/entities/conversation';
import { useQuery } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { QueryKey } from '../queries';

/**
 * gets a conversationItem 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} conversationId 
 * @returns {*}
 */
export const useConversationItemQuery = (orgId: string, conversationId: string) => useQuery<ConversationItem | undefined>({ queryKey: [orgId, conversationId, QueryKey.conversationItem], queryFn: async () => await getConversationItem(orgId, conversationId), enabled: !!orgId && !!conversationId })



/**
 * Fetches a conversation item 
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem>}
 */
export const getConversationItem = async (
  orgId: string,
  conversationId: string
): Promise<ConversationItem> => {
  console.log('hiihihi')
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/conversations/${conversationId}?includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId'])
      )}`
    )
  ).json();
  console.log(res)
  return res.data;
};



