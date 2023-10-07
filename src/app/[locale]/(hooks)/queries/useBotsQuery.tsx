
import { EntityItem } from 'electrodb';

import { Bot } from '@/entities/bot';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
* Returns bots 
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getBots>} params
* @returns {*}
*/
export const useBotsQuery = (params: Parameters<typeof getBots>) => useQuery<EntityItem<typeof Bot>[]>(
  {
    queryKey: [...params, QueryKey.bots],
    queryFn: () => getBots(...params) ?? [],
    keepPreviousData: true,
    enabled: !!params[0]
  })


/**
* fetches bots 
* @date 23/07/2023 - 12:24:28
*
* @async
* @param {string} orgId
* @returns {Promise<EntityItem<typeof Article>[]>}
*/
export const getBots = async (
  orgId: string,
): Promise<EntityItem<typeof Bot>[]> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/bots`
    )
  ).json();
  return res.data;
};
