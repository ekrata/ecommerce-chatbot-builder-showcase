import { EntityItem } from 'electrodb';

import { Analytic } from '@/entities/analytics';
import { Article } from '@/entities/article';
import { useQuery } from '@tanstack/react-query';

import { RelativeDateKey } from '../../dash/(root)/analytics/AnalyticsView';
import { QueryKey } from '../queries';

type AnalyticsQueryData = { current: EntityItem<typeof Analytic>[], previous: EntityItem<typeof Analytic>[] }

/**
* Returns analytics without content  
* @date 23/07/2023 - 12:27:11
*
* @param {Parameters<typeof getAnalytics>} params
* @returns {*}
*/
export const useAnalyticsQuery = (params: Parameters<typeof getAnalytics>) => useQuery<AnalyticsQueryData>(
  {
    queryKey: [...params, QueryKey.analytics],
    queryFn: () => getAnalytics(...params) ?? [],
    keepPreviousData: true,
    enabled: !!params[0]
  })

/**
* Returns analytics without their content
* @date 23/07/2023 - 12:24:28
*
* @async
* @param {string} orgId
* @param {string} lang 
* @returns {Promise<AnalyticsQueryData>}
*/
export const getAnalytics = async (
  orgId: string,
  fromTimestamp: number,
  endTimestamp: number,
  duration: RelativeDateKey
): Promise<AnalyticsQueryData> => {
  const res = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/analytics?fromTimestamp=${fromTimestamp}&endTimestamp=${endTimestamp}&duration=${duration}`
    )
  ).json();
  return res.data;
};
