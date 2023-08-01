import { EntityItem } from 'electrodb';

import { Configuration } from '@/entities/configuration';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * gets an org's configuration 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} conversationId 
 * @returns {*}
 */
export const useConfigurationQuery = (orgId: string) => useQuery<EntityItem<typeof Configuration> | undefined>({ queryKey: [orgId, QueryKey.configuration], queryFn: async () => await getConfiguration(orgId,), enabled: !!orgId })



/**
 * Fetches a conversation item 
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem>}
 */
export const getConfiguration = async (
  orgId: string,
): Promise<EntityItem<typeof Configuration>> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/configuration`
    )
  ).json();
  return res.data;
};



