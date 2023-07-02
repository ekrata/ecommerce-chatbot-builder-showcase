import { Customer } from "@/entities/customer";
import { EntityItem } from "electrodb";
import { QueryKey } from "../queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";

 
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
  return await res.json();
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
  return useQuery<EntityItem<typeof Customer>>({queryKey: [orgId, QueryKey.customer], initialData: () => {
    // Check if we have anything in cache and return that, otherwise get initial data
    const cachedData = queryClient.getQueryData<EntityItem<typeof Customer> | undefined>([orgId, QueryKey.customer]);
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  },
  cacheTime: Infinity,
  queryFn: async () => {
    const customer = queryClient.getQueryData<EntityItem<typeof Customer>>([orgId, QueryKey.customer])
    if (customer?.customerId) {
      return await getCustomer(orgId, customer?.customerId ?? '')
    } else {
      return undefined
    }}
  })
}

