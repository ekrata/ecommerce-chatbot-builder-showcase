import { EntityItem } from 'electrodb';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { createCustomer } from '@/app/actions';
import { CreateInteraction } from '@/entities/entities';
import { Interaction } from '@/entities/interaction';
import { Triggers } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

/**
 * Creates a customer. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useCreateInteractionMut = (orgId: string) => {
  return useMutation({
    mutationKey: [orgId, MutationKey.createInteraction],
    mutationFn: async (params: Parameters<typeof createInteraction>) => await createInteraction(...params),
  })
}



export const createInteraction = async (
  orgId: string,
  body: CreateInteraction
): Promise<EntityItem<typeof Interaction>> => {
  const interactionId = uuidv4()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/interactions/${interactionId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};

export const initialInteractionState: Record<string, object> = {
  [`${Triggers.VisitorClicksChatIcon}`]: { lastTrigger: undefined }
}

export const useInteractionState = () => {
  const [interactionState, setInteractionState] = useLocalStorage('interactionState', initialInteractionState)

}