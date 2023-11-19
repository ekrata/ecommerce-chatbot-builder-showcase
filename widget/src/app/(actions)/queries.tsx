import { EntityItem } from 'electrodb';

import { useQuery } from '@tanstack/react-query';

import { Article, ArticleSearchRes } from '../../../../stacks/entities/article';
import { Configuration } from '../../../../stacks/entities/configuration';
import { Org } from '../../../../stacks/entities/org';
import { searchArticles } from './orgs/articles/searchArticles';
import { getConfiguration } from './orgs/configurations/getConfiguration';

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
  operators = "operators",
  operatorPictureUploadUrl = 'operatorPictureUploadUrl',
}
