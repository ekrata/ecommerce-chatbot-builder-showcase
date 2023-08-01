import { EntityItem } from 'electrodb';

import { Translation } from '@/entities/translation';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../queries';

/**
 * gets an org'stranslation 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} conversationId 
 * @returns {*}
 */
export const useTranslationQuery = (orgId: string, lang: string) => useQuery<EntityItem<typeof Translation> | undefined>({ queryKey: [orgId, lang, QueryKey.translation], queryFn: async () => await getTranslation(orgId, lang), enabled: !!orgId })



/**
 * Fetches atranslation 
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} lang
 * @returns {Promise<EntityItem<typeof Translation>>}
 */
export const getTranslation = async (
  orgId: string,
  lang: string,
): Promise<EntityItem<typeof Translation>> => {
  return await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/translations/${lang}`
    )
  ).json();
};



