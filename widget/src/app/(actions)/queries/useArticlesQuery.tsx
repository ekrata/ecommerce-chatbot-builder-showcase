import { EntityItem } from 'electrodb';

import { useQuery } from '@tanstack/react-query';

import { Article } from '../../../../../stacks/entities/article';
import { QueryKey } from '../queries';

/**
* Returns articles without content  
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getArticles>} params
* @returns {*}
*/
export const useArticlesQuery = (params: Parameters<typeof getArticles>) => useQuery<EntityItem<typeof Article>[]>(
  {
    queryKey: [...params, QueryKey.articles],
    queryFn: () => getArticles(...params) ?? [],
    keepPreviousData: true,
    enabled: !!params[0]
  })


/**
* Returns articles without their content
* @date 23/07/2023 - 12:24:28
*
* @async
* @param {string} orgId
* @param {string} lang 
* @returns {Promise<EntityItem<typeof Article>[]>}
*/
export const getArticles = async (
  orgId: string,
  lang: string
): Promise<EntityItem<typeof Article>[]> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/lang/${lang}/articles`
    )
  ).json();
  return res.data;
};
