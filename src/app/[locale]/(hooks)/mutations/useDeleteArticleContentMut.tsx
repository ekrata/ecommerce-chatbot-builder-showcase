import { EntityItem } from 'electrodb';

import { ArticleContent } from '@/entities/articleContent';
import { useMutation } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

export const deleteArticleContent = async (
  orgId: string,
  lang: string,
  articleContentId: string,
): Promise<EntityItem<typeof ArticleContent>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/lang/${lang}/article-contents/${articleContentId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};



/**
 * Updates an article's content
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} lang 
 * @param {string} articleId 
 * @returns {*}
 */
export const useDeleteArticleContentMut = (orgId: string, lang: string, articleContentId: string) => {
  return useMutation({
    mutationKey: [orgId, lang, articleContentId, MutationKey.deleteArticleContent],
    mutationFn: async (params: Parameters<typeof deleteArticleContent>) => await deleteArticleContent(...params),
  })
}

