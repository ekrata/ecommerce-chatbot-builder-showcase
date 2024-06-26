import { EntityItem } from 'electrodb';

import { UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

export const updateOperator = async (
  orgId: string,
  operatorId: string,
  body: UpdateOperator
): Promise<EntityItem<typeof Operator>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators/${operatorId}`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};


const updateOperatorsReducer = (oldOperator: EntityItem<typeof Operator>[], updatedOperator: EntityItem<typeof Operator>) => {
  ({ ...oldOperator, ...updatedOperator })
}

/**
 * Creates an operator, and sets the operator session state 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @param {string} operatorId
 * @returns {*}
 */
export const useUpdateOperatorMut = (orgId: string, operatorId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, operatorId, MutationKey.updateOperator],
    mutationFn: async (params: Parameters<typeof updateOperator>) => await updateOperator(...params),
    onSuccess: (updatedOperator) => {
      const oldData = queryClient.getQueriesData([orgId, QueryKey.operators])
      updateOperatorsReducer((oldData as unknown as EntityItem<typeof Operator>[]).filter(({ operatorId }) => operatorId !== updatedOperator.operatorId), updatedOperator)
    }
  })
}

