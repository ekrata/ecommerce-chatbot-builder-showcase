import { EntityItem } from 'electrodb';
import { useSearchParams } from 'next/navigation';

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
export const useOrgQuery = () => {
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId') ?? ''
  if (!orgId) {
    throw new Error('No orgId can be parsed from url.')
  }
  return useQuery<EntityItem<typeof Org>>([QueryKey.org], async () => await getOrg(orgId))
}


export const getOrg = async (
  orgId: string,
): Promise<EntityItem<typeof Org>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  const data: EntityItem<typeof Org> = await res.json();
  return data
};
