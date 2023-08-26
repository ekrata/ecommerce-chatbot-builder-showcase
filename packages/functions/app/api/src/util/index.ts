import { ArticleCategory } from '@/entities/article';

export type MockOrgIds = {
  orgId: string;
  /**
   * Index corresponds to articleContentIds
   * @date 25/06/2023 - 13:00:19
   *
   * @type {string[]}
   */
  ownerId: string;
  adminId: string;
  moderatorId: string;
  articleIds: { articleId: string; articleContentId: string }[];
  lang: string;
  operatorIds: string[];
  customers: {
    customerId: string;
    conversations: { conversationId: string; messageIds: string[] }[];
    visitIds: string[];
  }[];
};

export const mockArticleTitles: { [key in ArticleCategory]: string[] } = {
  'General Information': [],
  Technical: [],
  Product: [],
  'Orders & Delivery': [
    'I want to change my order',
    'Customs & Import Fees',
    'How do I track my order?',
    'My order is wrong',
  ],
  'Returns & Refunds': [
    'Received a faulty item?',
    "I still haven't received my refund",
    'How do I return my items?',
    "Where's the swing tag on my item?",
    'Can I exchange my item?',
    'Returns Policy',
    'Returns Information',
    'How can I return something if I bought it at your event?`',
  ],
  'Payments & Promotions': [
    'Price changes',
    'Afterpay',
    'Discounts',
    'Payment Queries',
  ],
};

export interface MockArgs {
  mockLang: string;
  mockOrgCount: number;
  mockCustomerCount: number;
  mockOperatorCount: number;
  mockArticleCount: number;
  /**
   * Must always be less than mockArticleCount.
   * Describes how many articles contain the search phrase
   * @date 25/06/2023 - 13:14:06
   *
   * @type {4}
   */
  mockArticleSearchPhraseFreq: number;
  mockSearchPhrase: string;
  mockArticleHighlightCount: number;
  mockConversationCountPerCustomer: number;
  mockVisitsPerCustomer: number;
  mockMessageCountPerConversation: number;
}
