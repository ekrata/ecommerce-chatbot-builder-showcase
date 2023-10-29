import { EntityItem } from 'electrodb';

import { useQuery } from '@tanstack/react-query';

import { ArticleSearchRes } from '../../../../../stacks/entities/article';
import { QueryKey } from '../queries';

/**
* search articles by phrase in content, title  
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getArticles>} params
* @returns {*}
*/
export const useSearchArticlesQuery = (params: Parameters<typeof searchArticles>) => useQuery<ArticleSearchRes[]>(
  {
    queryKey: [...params, QueryKey.articles],
    queryFn: async () => await searchArticles(...params) ?? [],
    keepPreviousData: true,
    enabled: !!params[0] && !!params[1] && !!params[2]
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
export const searchArticles = async (
  orgId: string,
  lang: string,
  phrase: string
): Promise<ArticleSearchRes[]> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/lang/${lang}/articles/search?phrase=${phrase}`
    )
  ).json();
  return res.data;
};
