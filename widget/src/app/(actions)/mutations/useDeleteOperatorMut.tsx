import { EntityItem } from 'electrodb';

import { UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const deleteOperator = async (
  orgId: string,
  operatorId: string,
): Promise<EntityItem<typeof Operator>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators/${operatorId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};


const deleteOperatorReducer = (operators: EntityItem<typeof Operator>[], deletedOperator: EntityItem<typeof Operator>) => [...operators?.filter((operator) => operator.operatorId !== deletedOperator.operatorId)]

/**
 * Creates an operator, and sets the operator session state 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} operatorId
 * @returns {*}
 */
export const useDeleteOperatorMut = (orgId: string, operatorId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, operatorId, MutationKey.deleteOperator],
    mutationFn: async (params: Parameters<typeof deleteOperator>) => await deleteOperator(...params),
    onSuccess: (deletedOperator) => {
      queryClient.setQueryData<EntityItem<typeof Operator>[]>([orgId, QueryKey.operators], (oldData) => deleteOperatorReducer(oldData ?? [], deletedOperator))
    }
  })
}

