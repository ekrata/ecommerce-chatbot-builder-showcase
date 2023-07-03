import { EntityItem } from 'electrodb';

import { Article, ArticleSearchRes } from '@/entities/article';
import { Configuration } from '@/entities/configuration';
import { ConversationItem } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Org } from '@/entities/org';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getArticles } from '../(actions)/orgs/articles/getArticles';
import { searchArticles } from '../(actions)/orgs/articles/searchArticles';
import { getConfiguration } from '../(actions)/orgs/configurations/getConfiguration';
import { getConversationItems } from '../(actions)/orgs/conversations/getConversationItems';
import { getCustomer } from '../(actions)/orgs/customers/getCustomer';
import { getOrg } from '../(actions)/orgs/getOrg';

/**
 * Contains the values used for query keys. This should always be used.
 * @date 24/06/2023 - 10:45:39
 *
 * @export
 * @enum {number}
 */

export enum QueryKey {
  conversationItems = 'conversationItems',
  conversationItem = 'conversationItem',
  org = 'org',
  configuration = 'configuration',
  customer = 'customer',
  visitors = 'visitors',
  shopifyProducts = 'shopifyProducts',
  searchConversationItems = 'searchConversationItems',
  articles = 'articles',
  articleWithContent = 'articleWithContent',
  articlesSearch = 'articlesSearch',
  operators = "operators"
}


// const orgId = process.env.NEXT_PUBLIC_ORG_ID  ?? ''

/**
 * Returns configuration query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useConfigurationQuery = (orgId: string) => useQuery<EntityItem<typeof Configuration>>([orgId, QueryKey.configuration], async () => getConfiguration(orgId));
/**
 * Returns org query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @returns {*}
 */
export const useOrgQuery = (orgId: string) => useQuery<EntityItem<typeof Org>>([orgId, QueryKey.org], async () => await getOrg(orgId), {enabled: !!orgId});
/**
 * Returns articles query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} locale
 * @returns {*}
 */
export const useArticlesQuery = (orgId: string, locale: string) => useQuery<EntityItem<typeof Article>[]>([orgId, QueryKey.articles], async() => await getArticles(orgId, locale));

/**
 * Full text searches a phrase 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} locale
 * @param {string} phrase
 * @returns {*}
 */
export const useSearchArticlesQuery = (orgId: string, locale: string, phrase: string) => useQuery<ArticleSearchRes[]>([orgId, phrase, QueryKey.articles], 
  async() => {
  if(phrase.length > 3) {
    return await searchArticles(orgId, locale, phrase);
  } else {
    return []
  } 
})

