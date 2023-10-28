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
export const useOrgQuery = (orgId: string) => useQuery<EntityItem<typeof Org>>([QueryKey.org, orgId], async () => await getOrg(orgId));


export const getOrg = async (
  orgId: string,
): Promise<EntityItem<typeof Org>> => {
  console.log(`${process.env.NEXT_PUBLIC_APP_API_URL}`)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
