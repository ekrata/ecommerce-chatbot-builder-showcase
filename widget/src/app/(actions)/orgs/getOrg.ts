import { EntityItem } from 'electrodb';

import { Org } from '../../../../../stacks/entities/org';

export const getOrg = async (
  domain?: string,
): Promise<EntityItem<typeof Org>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/by-domain${
      domain && `?domain=${domain}`
    }`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
