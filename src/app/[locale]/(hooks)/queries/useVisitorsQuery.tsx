import { Customer } from "@/entities/customer";
import { EntityItem } from "electrodb";
import { QueryKey } from "../queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomer } from "../../(actions)/orgs/customers/getCustomer";
import { Operator } from "@/entities/operator";

/**
 * Returns customer query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} operatorId 
 * @returns {*}
 */
export const useOperatorsQuery = (orgId: string) => {
  const queryClient = useQueryClient();
  return useQuery<EntityItem<typeof Operator>>({queryKey: [orgId, QueryKey.operators], initialData: () => {
    // Check if we have anything in cache and return that, otherwise get initial data
    const cachedData = queryClient.getQueryData<EntityItem<typeof Operator> | undefined>([orgId, QueryKey.operators]);
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  },
  cacheTime: Infinity,
  queryFn: async () => {
    const customer = queryClient.getQueryData<EntityItem<typeof Operator>>([orgId, QueryKey.operators])
    if (customer?.customerId) {
      return await getCustomer(orgId, customer?.customerId ?? '')
    } else {
      return undefined
    }}
  })
}
