import { EntityItem } from 'electrodb';

import { ArticleContent } from '@/entities/articleContent';
import { CreateArticleContent } from '@/entities/entities';
import { useMutation } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

export const createArticleContent = async (
  orgId: string,
  lang: string,
  articleContentId: string,
  body: CreateArticleContent
): Promise<EntityItem<typeof ArticleContent>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/lang/${lang}/article-contents/${articleContentId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};



/**
 * Creates a article
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} lang 
 * @param {string} articleContentId 
 * @returns {*}
 */
export const useCreateArticleContentMut = (orgId: string, lang: string, articleContentId: string) => {
  return useMutation({
    mutationKey: [orgId, lang, articleContentId, MutationKey.createArticleContent],
    mutationFn: async (params: Parameters<typeof createArticleContent>) => await createArticleContent(...params),
  })
}

