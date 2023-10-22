import { ConversationItem } from '@/entities/conversation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import {
  ConversationFilterParams
} from '../../../../../packages/functions/app/api/src/conversations/listByCreatedAt';
import { QueryKey } from '../queries';

/**
 * Returns conversationItems query for customerId
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useConversationItemsByCustomerQuery = (orgId: string, customerId: string) => useQuery<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], async () => (orgId && customerId) ? await getConversationItemsByCustomer(orgId, customerId) : [], { enabled: !!orgId && !!customerId })

export const useConversationItemsQuery = (params: ConversationFilterParams) => useInfiniteQuery<{ cursor: string | null, data: ConversationItem[] }>({
  queryKey: [QueryKey.conversationItems, ...Object.values(params)],
  queryFn: async () => {
    return await getConversationItems(params)
  },
  getNextPageParam: (lastPage, pages) => lastPage.cursor,
})

/**
 * Returns sorted conversations by customerId
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem[]>}
 */
export const getConversationItemsByCustomer = async (
  orgId: string,
  customerId: string
): Promise<ConversationItem[]> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/conversations?customerId=${customerId}&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId'])
      )}`
    )
  ).json();
  sortConversationItems(res.data as ConversationItem[]);
  return res.data;
};


/**
 * Returns sorted conversations by fields
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<{cursor: string | null, data: ConversationItem[]}>}
 */
export const getConversationItems = async (
  params: ConversationFilterParams,
  pageParam = 0,
): Promise<{ cursor: string | null, data: ConversationItem[] }> => {
  console.log('hi')
  params.expansionFields = ['customerId', 'operatorId']
  if (params.operatorId === 'all' || params.operatorId === 'bots') {
    params.operatorId = ''
  }
  if (!params?.orgId) {
    return new Promise(() => [])
  }
  const res =
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${params.orgId}/conversations?cursor=${pageParam}&${queryParams(params)}`
    )

  const body = await res.json()
  if (Array.isArray(body)) {
    sortConversationItems(body as ConversationItem[]);
  }
  return body
};



function queryParams(data: any) {
  return Object.entries(data).filter(([key, value]) => value).map(([key, value]) => value && `${key}=${encodeURIComponent(value as string | number | boolean)}`).join('&')
}