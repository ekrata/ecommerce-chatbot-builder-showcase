import { ConversationFilterParams } from 'packages/functions/app/api/src/conversations/list';

import { ConversationItem, ConversationItemSearchRes } from '@/entities/conversation';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

export const useSearchConversationItemsQuery = (params: ConversationFilterParams) => useQuery<ConversationItemSearchRes[]>(
  {
    queryKey: [params.orgId, params.operatorId, params.channel, params.status, params.updatedAt, QueryKey.searchConversationItems, params.cursor], 
    queryFn: () => searchConversationItems(params) ?? [],
    keepPreviousData: true,
    enabled: !!params.orgId
  })

/**
 * Searches & filters for conversationItems
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItemSearchRes[]>}
 */
export const searchConversationItems = async (
  params:  ConversationFilterParams
): Promise<ConversationItemSearchRes[]> => {
  params.expansionFields = ['customerId', 'operatorId']
  if(params.operatorId === 'all' || params.operatorId === 'bots') {
    params.operatorId = ''
  }
  const res = await (
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${params.orgId}/conversations/search?${new URLSearchParams(JSON.stringify(params)).toString()}`
    )
  ).json();
  return res.data;
};