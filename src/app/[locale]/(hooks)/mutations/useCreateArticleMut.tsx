import { EntityItem } from 'electrodb';

import { Article } from '@/entities/article';
import { ConversationItem, ExpandedConversation } from '@/entities/conversation';
import { CreateArticle, CreateConversation } from '@/entities/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const createArticle = async (
  orgId: string,
  lang: string,
  articleId: string,
  body: CreateArticle
): Promise<EntityItem<typeof Article>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${lang}/${orgId}/articles/${articleId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};



const createArticleReducer = (articles: EntityItem<typeof Article>[], createdArticle: EntityItem<typeof Article>) => {
  return [createdArticle, ...articles]
}

/**
 * Creates a message, 
 * then assigns the new message response
 * to the end of the conversationItem's messages array. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} customerId
 * @param {string} conversationId
 * @returns {*}
 */
export const useCreateArticleMut = (orgId: string, lang: string, articleId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, lang, articleId, MutationKey.createArticle],
    mutationFn: async (params: Parameters<typeof createArticle>) => await createArticle(...params),
    onSuccess: (createdArticle) => {
      queryClient.setQueryData<EntityItem<typeof Article>[]>([orgId, lang, MutationKey.createArticle], (oldData) => createArticleReducer(oldData ?? [], createdArticle))
    }
  })
}

