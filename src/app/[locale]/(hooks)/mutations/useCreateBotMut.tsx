import { Bot } from 'aws-sdk/clients/chime';

import { ExpandedConversation } from '@/entities/conversation';
import { CreateBot } from '@/entities/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCustomer } from '../../chat-widget/actions';
import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

/**
 * Creates a bot. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useCreateBotMut = (orgId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [orgId, MutationKey.createBot],
    mutationFn: async (params: Parameters<typeof createBot>) => await createBot(...params),
    onSuccess: data => {
      queryClient.setQueryData([orgId, QueryKey.bots], () => data)
    }
  })
}

export const createBot = async (createBot: CreateBot): Promise<Bot> => {
  const { orgId, botId } = createBot
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/bots/${botId}`,
    { method: 'POST', body: JSON.stringify(createBot) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};
