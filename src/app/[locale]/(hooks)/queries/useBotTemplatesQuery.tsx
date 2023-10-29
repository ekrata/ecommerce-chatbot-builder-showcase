
import { EntityItem } from 'electrodb';

import { Bot } from '@/entities/bot';
import { BotTemplate } from '@/entities/botTemplate';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
* Returns bots 
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getBots>} params
* @returns {*}
*/
export const useBotsQuery = (params: Parameters<typeof getBotTemplates>) => useQuery<EntityItem<typeof BotTemplate>[]>(
  {
    queryKey: [...params, QueryKey.botTemplates],
    queryFn: async () => {
      return await getBotTemplates(...params) ?? []
    },
    // keepPreviousData: true,
    // enabled: !!params[0]
  })


/**
* fetches bots 
* @date 23/07/2023 - 12:24:28
*
* @async
* @param {string} orgId
* @returns {Promise<EntityItem<typeof Article>[]>}
*/
export const getBotTemplates = async (
): Promise<EntityItem<typeof BotTemplate>[]> => {
  const res =
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL}/bot-templates`
    )
  // console.log(res)
  const data = await res.json()
  return data
};
