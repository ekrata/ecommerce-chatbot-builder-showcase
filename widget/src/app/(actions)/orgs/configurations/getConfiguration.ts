import { EntityItem } from 'electrodb';

import { Configuration } from '../../../../../../../../../stacks/entities/configuration';

export /**
 * Gets the configuration for the org
 * @date 21/06/2023 - 21:16:53
 *
 * @async
 * @param {string} orgId
 * @returns {Promise<EntityItem<typeof Configuration>>}
 */
const getConfiguration = async (
  orgId: string,
): Promise<EntityItem<typeof Configuration>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/configuration`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
