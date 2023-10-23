import { EntityItem } from 'electrodb';

/**
 * Contains the values used for query keys. This should always be used.
 * @date 24/06/2023 - 10:45:39
 *
 * @export
 * @enum {number}
 */

export enum QueryKey {
  session = 'session',
  conversationItems = 'conversationItems',
  conversationItem = 'conversationItem',
  org = 'org',
  configuration = 'configuration',
  translation = 'translation',
  customer = 'customer',
  customers = 'customers',
  bot = 'bot',
  bots = 'bots',
  visits = 'visits',
  shopifyProducts = 'shopifyProducts',
  searchConversationItems = 'searchConversationItems',
  articles = 'articles',
  articleWithContent = 'articleWithContent',
  articlesSearch = 'articlesSearch',
  operators = "operators"
}

