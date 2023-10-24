import { EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { Customer } from '@/entities/customer';
import { CreateCustomer } from '@/entities/entities';
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
export const useCreateCustomerMut = (orgId: string, customerId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.createCustomer],
    mutationFn: async (params: Parameters<typeof createCustomer>) => await createCustomer(...params),
    onSuccess: data => {
      console.log(data)
      queryClient.setQueryData([orgId, customerId, QueryKey.customer], () => data)
    }
  })
}


const createCustomer = async (orgId: string, customerId: string, body: CreateCustomer): Promise<EntityItem<typeof Customer>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/customers/${customerId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};
