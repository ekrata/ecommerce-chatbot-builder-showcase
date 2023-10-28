import { EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { Visit } from '@/entities/customer';
import { CreateVisit } from '@/entities/entities';
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
export const useCreateVisitMut = (orgId: string, visitId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, visitId, MutationKey.createVisit],
    mutationFn: async (params: Parameters<typeof createVisit>) => await createVisit(...params),
    onSuccess: data => {
      console.log(data)
      queryClient.setQueryData([orgId, visitId, QueryKey.visits], () => data)
    }
  })
}


const createVisit = async (orgId: string, visitId: string, body: CreateVisit): Promise<EntityItem<typeof Visit>> => {
  if (orgId && visitId) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/visits/${visitId}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }
    return res.json()
  }
  return {}
};
