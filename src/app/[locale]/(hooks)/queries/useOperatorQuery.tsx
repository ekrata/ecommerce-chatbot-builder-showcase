import { EntityItem } from 'electrodb';

import { Operator } from '@/entities/operator';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * Gets an operator 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @returns {unknown}
 */
export const getOperator = async (orgId?: string, operatorId?: string) => {
  console.log(orgId, operatorId)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators/${operatorId}`
  );
  console.log(res)
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};

/**
 * Returns operator query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} operatorId 
 * @returns {*}
 */
export const useOperatorQuery = (orgId?: string, operatorId?: string) => {
  return useQuery<EntityItem<typeof Operator>>({
    queryKey: [QueryKey.operator, orgId, operatorId],
    queryFn: async () => {
      console.log('hi')
      return await getOperator(orgId, operatorId)
    }
    // enabled: !!orgId && !!operatorId
  })
}
