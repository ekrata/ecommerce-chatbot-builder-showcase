import { EntityItem } from 'electrodb';

import { UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const createOperator = async (
  orgId: string,
  operatorId: string,
  body: UpdateOperator
): Promise<EntityItem<typeof Operator>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators/${operatorId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};


const createOperatorReducer = (oldOperators: EntityItem<typeof Operator>[], newOperator: EntityItem<typeof Operator>) => {
  return [...oldOperators, newOperator]
}

/**
 * Creates an operator, and updates the operators query 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} operatorId
 * @returns {*}
 */
export const useCreateOperatorMut = (orgId: string, operatorId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, operatorId, MutationKey.createOperator],
    mutationFn: async (params: Parameters<typeof createOperator>) => await createOperator(...params),
    onSuccess: (newOperator) => {
      queryClient.setQueryData<EntityItem<typeof Operator>[]>([orgId, QueryKey.operators], (oldData) => createOperatorReducer(oldData ?? [], newOperator))
    }
  })
}

