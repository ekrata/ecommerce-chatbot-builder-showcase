import { ConversationChannel, ConversationItem, ConversationStatus, ConversationTopic, ConversationType } from "@/entities/conversation";
import { QueryKey } from "../queries";
import { useQuery } from "@tanstack/react-query";
import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { ConversationFilterParams } from "packages/functions/app/api/src/conversations/list";

/**
 * Returns conversationItems query for customerId
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useConversationItemsByCustomerQuery = (orgId: string, customerId: string) => useQuery<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], async () => (orgId && customerId) ? await getConversationItemsByCustomer(orgId, customerId) : [], {enabled: !!orgId && !!customerId})



export const useConversationItemsQuery = (params: ConversationFilterParams) => useQuery<ConversationItem[]>(
  {
    queryKey: [params.orgId, params.operatorId, params.channel, params.status, params.updatedAt, QueryKey.conversationItems, params.cursor], 
    queryFn: () => getConversationItems(params) ?? [],
    keepPreviousData: true,
    enabled: !!params.orgId
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


/**
 * Returns sorted conversations by fields
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem[]>}
 */


export const getConversationItems = async (
  params: ConversationFilterParams
): Promise<ConversationItem[]> => {
  params.expansionFields = ['customerId', 'operatorId']
  if(params.operatorId === 'all' || params.operatorId === 'bots') {
    params.operatorId = ''
  }
  const res = await (
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${params.orgId}/conversations?${new URLSearchParams(JSON.stringify(params)).toString()}`
    )
  ).json();
  sortConversationItems(res.data as ConversationItem[]);
  return res.data;
};



