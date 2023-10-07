import { EntityItem } from 'electrodb';

import { Article } from '@/entities/article';
import { Bot } from '@/entities/bot';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

export const deleteBot = async (
  orgId: string,
  botId: string,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/bots/${botId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};

const deleteBotReducer = (bots: EntityItem<typeof Bot>[], deletedArticle: EntityItem<typeof Bot>) => {
  const idx = bots.findIndex((bot) => bot?.botId === deletedArticle?.botId)
  delete bots[idx]
  return [...bots]
}

/**
 * Deletes a bot by id 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} botId
 * @returns {*}
 */
export const useDeleteBotMut = (orgId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.deleteBot],
    mutationFn: async (params: Parameters<typeof deleteBot>) => await deleteBot(...params),
    onSuccess: (deletedBot) => {
      queryClient.setQueryData<EntityItem<typeof Bot>[]>([orgId, MutationKey.deleteBot], (oldData) => deleteBotReducer(oldData ?? [], deletedBot))
    }
  })
}

