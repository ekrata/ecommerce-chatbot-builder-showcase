import { ConversationItem } from '@/entities/conversation';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import {
    ConversationFilterParams
} from '../../../../../packages/functions/app/api/src/conversations/listByCreatedAt';
import { useDashStore } from '../../dash/(root)/(actions)/useDashStore';
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

export const useConversationItemsQuery = (params: ConversationFilterParams, cursor: string | undefined | null) => {
  console.log(cursor)
  const { conversationListFilter, setConversationListFilter } = useDashStore((state) => state)
  return useQuery<{ cursor: string | null, data: ConversationItem[] }>({
    queryKey: [QueryKey.conversationItems, ...Object.values(params), cursor],
    queryFn: async ({ pageParam, queryKey }) => {
      // const data = queryClient.getQueryData(queryKey) as { cursor: string | null, data: ConversationItem[] }[]
      console.log(params?.cursor)
      const res = await getConversationItems(params, cursor)
      // setConversationListFilter({ ...conversationListFilter, cursor: res?.cursor ?? undefined })
      // console.log(data?.pages)
      return res
      // return { ...data, pages: [...data?.pages, res] }
      // queryClient.setQueryData(queryKey, (data: InfiniteData<{
      //   cursor: string | null;
      //   data: ConversationItem[];
      // }> | undefined) => {
      //   if (data) {
      //     return {
      //       pages: [...data.pages, res],
      //       pageParams: data.pageParams,
      //     }
      //   }
      // },
    },
    enabled: !!params?.orgId,
    keepPreviousData: true,
    getPreviousPageParam: (firstPage) => firstPage?.cursor ?? null,
    getNextPageParam: (lastPage) => {
      // console.log('lastPage', lastPage)
      return lastPage?.cursor ?? null
    },
  })
}

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
  cursor?: string | undefined | null

): Promise<{ cursor: string | null, data: ConversationItem[] }> => {
  console.log('hi')
  const res =
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${params?.orgId}/conversations?${cursor ? `cursor=${cursor}&` : ''}${toQueryParams({ ...params, operatorId: params.operatorId === 'all' || params.operatorId === 'bots' ? '' : params?.operatorId, expansionFields: ['customerId', 'operatorId'] } as ConversationFilterParams)}`
    )

  const body = await res.json()
  if (Array.isArray(body)) {
    sortConversationItems(body as ConversationItem[]);
  }
  console.log(body)
  return body
};



export function toQueryParams(data: object) {
  return Object.entries(data).filter(([key, value]) => value).map(([key, value]) => value && `${key}=${encodeURIComponent(value as string | number | boolean)}`).join('&')
}