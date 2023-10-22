import { EntityItem } from 'electrodb';

import { UpdateTranslation } from '@/entities/entities';
import { Translation } from '@/entities/translation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { updateTranslation } from './useUpdateTranslationMut';

/**
 * Deletes an organisation's translation
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const deleteChatWidgetTranslation = async (
  orgId: string,
  lang: string,
  body: UpdateTranslation
): Promise<EntityItem<typeof Translation>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/translations/${lang}`,
    { method: 'PATCH', body: JSON.stringify({ ...body, translations: { ...body.translations, chatWidget: {} } } as EntityItem<typeof Translation>) }
  )
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};

/**
 * Deletes an organisation's translation
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} lang
 * @returns {*}
 */
export const useDeleteChatWidgetTranslation = (orgId: string, lang: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, lang, MutationKey.deleteTranslation],
    mutationFn: async (params: Parameters<typeof updateTranslation>) => await deleteChatWidgetTranslation(...params),
    onSuccess: (updatedTranslation) => {
      queryClient.setQueryData<EntityItem<typeof Translation>>([orgId, lang, MutationKey.deleteTranslation], () => updatedTranslation)
    }
  })
}
