import { EntityItem } from 'electrodb';

import { Operator } from '@/entities/operator';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * Gets operators 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @returns {unknown}
 */
export const getOperators = async (orgId: string, online?: boolean) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators`
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};

/**
 * Returns operators query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} operatorId 
 * @returns {*}
 */
export const useOperatorsQuery = (orgId: string, online?: boolean) => {
  return useQuery<EntityItem<typeof Operator>[]>({
    queryKey: [orgId, QueryKey.operators],
    queryFn: async () => {
      const data = await getOperators(orgId) ?? []
      return data.data

    }
  })
}
