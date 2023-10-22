import { EntityItem } from 'electrodb';

import { Org } from '@/entities/org';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * Returns org query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useOrgQuery = () => useQuery<EntityItem<typeof Org>>([QueryKey.org], async () => await getOrg());


export const getOrg = async (
  domain?: string,
): Promise<EntityItem<typeof Org>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/by-domain`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
