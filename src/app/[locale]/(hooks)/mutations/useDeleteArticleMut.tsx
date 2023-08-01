import { EntityItem } from 'electrodb';

import { Article } from '@/entities/article';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

export const deleteArticle = async (
  orgId: string,
  lang: string,
  articleId: string,
): Promise<EntityItem<typeof Article>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${lang}/${orgId}/articles/${articleId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};



const deleteArticleReducer = (articles: EntityItem<typeof Article>[], deletedArticle: EntityItem<typeof Article>) => {
  const idx = articles.findIndex((article) => article.articleId === deletedArticle.articleId)
  delete articles[idx]
  return [...articles]
}

/**
 * Deletes an article by id
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} lang
 * @param {string} articleId
 * @returns {*}
 */
export const useDeleteArticleMut = (orgId: string, lang: string, articleId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, lang, articleId, MutationKey.createArticle],
    mutationFn: async (params: Parameters<typeof deleteArticle>) => await deleteArticle(...params),
    onSuccess: (deletedArticle) => {
      queryClient.setQueryData<EntityItem<typeof Article>[]>([orgId, lang, MutationKey.deleteArticle], (oldData) => deleteArticleReducer(oldData ?? [], deletedArticle))
    }
  })
}

