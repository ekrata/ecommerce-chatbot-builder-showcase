import { EntityItem } from 'electrodb';

import { Bot } from '@/entities/bot';
import { UpdateBot, UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const updateBot = async (
  orgId: string,
  botId: string,
  body: UpdateBot
): Promise<EntityItem<typeof Bot>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/bots/${botId}`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};


const updateBotReducer = (oldBots: EntityItem<typeof Bot>[], updatedBot: EntityItem<typeof Bot>) => {
  return [...(oldBots ?? []), updatedBot]
}

/**
 * Creates an operator, and sets the operator session state 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} operatorId
 * @returns {*}
 */
export const useUpdateBotMut = (orgId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.updateBot],
    mutationFn: async (params: Parameters<typeof updateBot>) => await updateBot(...params),
    onSuccess: (updatedBot) => {
      const oldBots = queryClient.getQueryData([orgId, QueryKey.bots]) as EntityItem<typeof Bot>[]
      updateBotReducer(oldBots, updatedBot)
    }
  })
}

