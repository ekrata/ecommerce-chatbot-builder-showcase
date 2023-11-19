import { ExpandedVisit } from '@/entities/visit';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';
import { toQueryParams } from './useConversationItemsQuery';

export interface PaginateQueryParams {
  cursor: string | undefined
}

/**
 * Gets a list of visits 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @returns {unknown}
 */
export const getVisits = async (orgId: string, cursor: string | null | undefined, customerId?: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/visits?${toQueryParams({ cursor, customerId })}`,
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};


/**
 * Returns visits query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useVisitsQuery = (orgId: string, pageCursor: string | null | undefined, customerId?: string) => {
  return useQuery<{
    data: ExpandedVisit[], cursor: string | undefined
  }>({
    queryKey: [QueryKey.visits, orgId, , pageCursor, customerId],
    queryFn: async () => await getVisits(orgId, pageCursor, customerId)
  })
}

