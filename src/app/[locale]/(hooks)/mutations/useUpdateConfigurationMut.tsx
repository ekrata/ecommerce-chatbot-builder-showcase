import { EntityItem } from 'electrodb';

import { Article } from '@/entities/article';
import { Configuration } from '@/entities/configuration';
import { UpdateConfiguration } from '@/entities/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationKey } from '../mutations';

/**
 * Updates an organisation's configuration
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const updateConfiguration = async (
  orgId: string,
  body: UpdateConfiguration
): Promise<EntityItem<typeof Configuration>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/configuration`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json()
};





/**
 * Updates an organisation's configuration
 * @date 24/06/2023 - 12:33:18
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useUpdateConfigurationMut = (orgId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [orgId, MutationKey.updateConfiguration],
    mutationFn: async (params: Parameters<typeof updateConfiguration>) => await updateConfiguration(...params),
    onSuccess: (updatedConfiguration) => {
      queryClient.setQueryData<EntityItem<typeof Configuration>>([orgId, MutationKey.updateConfiguration], () => updatedConfiguration)
    }
  })
}
