import { EntityItem } from 'electrodb';

import { Customer } from '@/entities/customer';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * Gets visitors 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {unknown}
 */
export const getVisitors = async (orgId: string): Promise<EntityItem<typeof Customer>[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/customers/?online=true`
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
};


/**
 * Returns customer query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useVisitorsQuery = (orgId: string) => useQuery<EntityItem<typeof Customer>[]>(
  {
    queryKey: [orgId, QueryKey.visitors],
    queryFn: async () => {
      return getVisitors(orgId)
    }
  })