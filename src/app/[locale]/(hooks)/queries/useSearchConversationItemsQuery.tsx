import { ConversationItemSearchRes } from '@/entities/conversation';
import {
  ConversationFilterParams
} from '@/packages/functions/app/api/src/conversations/listByCreatedAt';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';
import { toQueryParams } from './useConversationItemsQuery';

export const useSearchConversationItemsQuery = (params: ConversationFilterParams & { phrase: string }) => useQuery<ConversationItemSearchRes[]>(
  {
    queryKey: [params.orgId, params.operatorId, params.channel, params.status, params.updatedAt, QueryKey.searchConversationItems, params.cursor],
    queryFn: async () => await searchConversationItems(params) ?? [],
    enabled: !!params.orgId && !!params?.phrase
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
  params: ConversationFilterParams & { phrase: string }
): Promise<ConversationItemSearchRes[]> => {
  params.expansionFields = ['customerId', 'operatorId']
  if (params.operatorId === 'all' || params.operatorId === 'bots') {
    params.operatorId = ''
  }
  console.log(`/orgs/${params.orgId}/conversations/search?${toQueryParams(params)}`)
  const resData = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${params.orgId}/conversations/search?${toQueryParams(params)}`
    )
  ).json();
  return resData;
};