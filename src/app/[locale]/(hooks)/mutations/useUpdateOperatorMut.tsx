import { EntityItem } from 'electrodb';

import { UpdateOperator } from '@/entities/entities';
import { Operator } from '@/entities/operator';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '../AuthProvider';
import { MutationKey } from '../mutations';

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


const updateOperatorReducer = (oldOperator: EntityItem<typeof Operator>, updatedOperator: EntityItem<typeof Operator>) => {
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
  const [user, setAuthContext, refetch] = useAuthContext()
  return useMutation({
    mutationKey: [orgId, operatorId, MutationKey.updateOperator],
    mutationFn: async (params: Parameters<typeof updateOperator>) => await updateOperator(...params),
    onSuccess: async (updatedOperator) => {
      if (user) {
        console.log(user, updatedOperator)
        if (user?.operatorId === updatedOperator?.operatorId) {
          await refetch()
        }
        updateOperatorReducer(user, updatedOperator)
      }
    }
  })
}

