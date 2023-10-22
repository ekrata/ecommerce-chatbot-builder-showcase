
import { EntityItem } from 'electrodb';

import { Bot } from '@/entities/bot';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
* bot query 
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getBot>} params
* @returns {*}
*/
export const useBotQuery = (params: Parameters<typeof getBot>) => useQuery<EntityItem<typeof Bot>>(
  {
    queryKey: [...params, QueryKey.bot],
    queryFn: () => getBot(...params),
    keepPreviousData: true,
    enabled: !!params[0]
  })


/**
* Returns a bot of botId 
* @date 23/07/2023 - 12:24:28
*
* @async
* @param {string} orgId
* @param {string} botId 
* @returns {Promise<EntityItem<typeof Article>[]>}
*/
export const getBot = async (
  orgId: string,
  botId: string
): Promise<EntityItem<typeof Bot>> => {
  const res =
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/bots/${botId}`
    )
  const data = await res.json()
  return data ?? {}
};
