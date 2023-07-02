import { Customer } from "@/entities/customer";
import { EntityItem } from "electrodb";
import { QueryKey } from "../queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomer } from "../../(actions)/orgs/customers/getCustomer";
import { Operator } from "@/entities/operator";


/**
 * Gets operators 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @returns {unknown}
 */
export const getOperators = async (orgId: string, online: boolean) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators?online=${online}`
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};

/**
 * Returns operators query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} operatorId 
 * @returns {*}
 */
export const useOperatorsQuery = (orgId: string, online: boolean) => {
  const queryClient = useQueryClient();
  return useQuery<EntityItem<typeof Operator>[]>({queryKey: [orgId, QueryKey.operators], initialData: () => {
    // Check if we have anythring in cache and return that, otherwise get initial data
    const cachedData = queryClient.getQueryData<EntityItem<typeof Operator>[]>([orgId, QueryKey.operators]);
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  },
  cacheTime: Infinity,
  queryFn: async () => {
    const operators = queryClient.getQueryData<EntityItem<typeof Operator>[]>([orgId, QueryKey.operators])
    if (operators?.length) {
      return await getOperators(orgId, online)
    } else {
      return undefined
    }}
  })
}
