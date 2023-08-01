import { EntityItem } from 'electrodb';

import { Article } from '@/entities/article';
import { UpdateArticle } from '@/entities/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

export const updateArticle = async (
  orgId: string,
  lang: string,
  articleId: string,
  body: UpdateArticle
): Promise<EntityItem<typeof Article>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${lang}/${orgId}/articles/${articleId}`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};



const updateArticleReducer = (articles: EntityItem<typeof Article>[], updatedArticle: EntityItem<typeof Article>) => {
  const idx = articles.findIndex((article) => article.articleId === updatedArticle.articleId)
  articles[idx] = updatedArticle
  return [...articles]
}

/**
 * Creates an article 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} lang 
 * @param {string} articleId 
 * @returns {*}
 */
export const useUpdateArticleMut = (orgId: string, lang: string, articleId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, lang, MutationKey.updateArticle],
    mutationFn: async (params: Parameters<typeof updateArticle>) => await updateArticle(...params),
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData<EntityItem<typeof Article>[]>([orgId, lang, MutationKey.updateArticle], (oldData) => updateArticleReducer(oldData ?? [], updatedArticle))
    }
  })
}

