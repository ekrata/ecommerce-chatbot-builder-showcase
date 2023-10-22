import { EntityItem } from 'electrodb';

import { Customer } from '@/entities/customer';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryKey } from '../queries';

export interface PaginateQueryParams {
  cursor: string | undefined
}

export interface GetCustomersQueryParams extends PaginateQueryParams {
  online?: string
}
/**
 * Gets a list of customers 
 * @date 29/06/2023 - 08:20:59
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {unknown}
 */
export const getCustomers = async (orgId: string, queryParams: GetCustomersQueryParams) => {
  const params = new URLSearchParams(Object.entries(queryParams)).toString()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/customers?${params}`
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
export const useCustomersQuery = (orgId: string, queryParams: GetCustomersQueryParams) => {
  return useQuery<{
    data: EntityItem<typeof Customer>[], cursor: string | undefined
  }>({
    queryKey: [orgId, ...Object.values(queryParams), QueryKey.customers],
    queryFn: async () => getCustomers(orgId, queryParams)
  })
}

