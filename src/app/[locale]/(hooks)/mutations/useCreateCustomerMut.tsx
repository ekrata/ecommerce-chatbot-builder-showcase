import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCustomer } from '../../chat-widget/actions';
import { MutationKey } from '../mutations';
import { QueryKey } from '../queries';

/**
 * Creates a customer. 
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useCreateCustomerMut = (orgId: string, customerId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.createCustomer],
    mutationFn: async (params: Parameters<typeof createCustomer>) => await createCustomer(...params),
    onSuccess: data => {
      queryClient.setQueryData([orgId, customerId, QueryKey.customer], () => data)
    }
  })
}