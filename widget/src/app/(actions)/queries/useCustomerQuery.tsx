import { EntityItem } from 'electrodb';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { Customer } from '@/entities/customer';
import { CreateCustomer } from '@/entities/entities';
import { Triggers } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCreateCustomerMut } from '../mutations/useCreateCustomerMut';
import { useCreateInteractionMut } from '../mutations/useCreateInteractionMut';
import { QueryKey } from '../queries';
import { useChatWidgetStore } from '../useChatWidgetStore';

/**
 * Gets a customer 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {unknown}
 */
export const getCustomer = async (orgId: string, customerId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/customers/${customerId}`
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json() ?? null
};


/**
 * Returns customer query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useCustomerQuery = (orgId: string) => {
  const queryClient = useQueryClient();
  const newCustomerId = uuidv4()
  const createCustomerMut = useCreateCustomerMut(orgId, newCustomerId);
  const createInteractionMut = useCreateInteractionMut(orgId);
  const [interactionHistory, setInteractiosnHistory] = useLocalStorage<Partial<Record<keyof typeof Triggers, number>>>('interactionHistory', {})
  return useQuery<EntityItem<typeof Customer>>({
    queryKey: [orgId, QueryKey.customer],
    // initialData: () => {
    //   // Check if we have anything in cache and return that, otherwise get initial data
    //   const cachedData = queryClient.getQueryData<EntityItem<typeof Customer> | undefined>([orgId, QueryKey.customer]);
    //   if (cachedData) {
    //     return cachedData;
    //   }
    // },
    cacheTime: Infinity,
    enabled: !!orgId,
    queryFn: async (data) => {
      console.log(data)
      const customerCache = queryClient.getQueryCache().find(data?.queryKey)
      console.log(customerCache)
      const customer = queryClient.getQueryCache<EntityItem<typeof Customer>>([data?.queryKey])
      console.log(customer)
      if (customer?.customerId) {
        return await getCustomer(orgId, customer?.customerId ?? '')
      } else {
        const newCustomerId = uuidv4()
        const data = await createCustomerMut.mutateAsync([orgId, newCustomerId, {
          customerId: newCustomerId, orgId,
          locale: window?.navigator?.language, online: true, address: '', timezone: Intl.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 0, city: '', userAgent: window.navigator.userAgent



        }])
        console.log(data)
        queryClient.setQueryData([orgId, QueryKey.customer], () => data)
        await createInteractionMut.mutateAsync([orgId, { customerId: newCustomerId, orgId, createdAt: Date.now(), channel: 'website', status: 'unassigned', type: Triggers.FirstVisitOnSite, lastTriggered: interactionHistory.FirstVisitOnSite }])
      }
    }
  })
}

