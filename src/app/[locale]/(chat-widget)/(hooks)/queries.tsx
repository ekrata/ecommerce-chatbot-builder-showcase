import { Configuration } from "@/entities/configuration";
import { useQuery } from "@tanstack/react-query";
import { EntityItem } from "electrodb";
import { getConfiguration } from "../(actions)/orgs/configurations/getConfiguration";
import { Org } from "@/entities/org";
import { Customer } from "@/entities/customer";
import { getArticles } from "../(actions)/orgs/articles/getArticles";
import { getOrg } from "../(actions)/orgs/getOrg";
import { Article, ArticleSearchRes } from "@/entities/article";
import { ConversationItem } from "@/entities/conversation";
import { getConversationItems } from "../(actions)/conversations/getConversationItems";
import { getCustomer } from "../(actions)/customers/getCustomer";
import { searchArticles } from "../(actions)/articles/searchArticles";

/**
 * Contains the values used for query keys. This should always be used. 
 * @date 24/06/2023 - 10:45:39
 *
 * @export
 * @enum {number}
 */
export enum QueryKey {
  conversationItems = 'conversationItems',
  conversationItem = 'conversationItem' ,
  org = 'org',
  configuration = 'configuration',
  customer = 'customer',
  articles = 'articles',
  articlesSearch = 'articlesSearch'
}


// const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID  ?? ''

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
 * Returns customer query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useCustomerQuery = (orgId: string, customerId: string) => useQuery<EntityItem<typeof Customer>>([orgId, QueryKey.customer], async () => getCustomer(orgId, customerId), {enabled: !!customerId})

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

/**
 * Returns conversationItems query 
 * @date 24/06/2023 - 10:45:39
 *
 * @param {string} orgId
 * @param {string} customerId
 * @returns {*}
 */
export const useConversationItemsQuery = (orgId: string, customerId:string) => useQuery<ConversationItem[]>([orgId, customerId, QueryKey.conversationItems], async () => (orgId && customerId) ? await getConversationItems(orgId, customerId) : [], {enabled: !!orgId && !!customerId})


