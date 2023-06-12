import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

/**
 * Status of article
 * @date 12/06/2023 - 17:08:29
 *
 * @type {readonly ["draft", "in review", "published"]}
 */
export const articleStatus = ['draft', 'in review', 'published'] as const;
/**
 *
 * @date 12/06/2023 - 17:08:29
 *
 * @export
 * @typedef {ArticleStatus}
 */
export type ArticleStatus = (typeof articleStatus)[number];

/**
 * Categorizes an article
 * @date 12/06/2023 - 17:08:29
 *
 * @type {(readonly ["General Information", "Orders & Delivery", "Returns & Refunds", "Payments & Promotions", "Technical", "Product"])}
 */
export const articleCategory = [
  'General Information',
  'Orders & Delivery',
  'Returns & Refunds',
  'Payments & Promotions',
  'Technical',
  'Product',
] as const;

/**
 * Basic Article Entity that stores Rich Text Format data
 * @date 12/06/2023 - 17:08:29
 *
 * @type {*}
 */
export const Article = new Entity({
  model: {
    entity: 'article',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    articleId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      required: true,
    },
    operatorId: {
      type: 'string',
      required: true,
    },
    category: {
      type: articleCategory,
      required: true,
    },
    status: {
      type: articleStatus,
      required: true,
    },
    rating: {
      type: 'number',
    },
    title: {
      type: 'string',
      required: true,
    },
    content: {
      type: 'string',
      required: true,
    },
    createdAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
    },
    updatedAt: {
      type: 'number',
      readOnly: true,
      default: Date.now(),
      watch: '*',
      set: () => Date.now(),
    },
  },
  indexes: {
    get: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'articleId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    // assigned: {
    //   index: 'gsi1pk-gsi1sk-index',
    //   pk: {
    //     field: 'gsi1pk',
    //     composite: ['orgId', 'operatorId'],
    //   },
    //   sk: {
    //     field: 'gsi1sk',
    //     composite: ['updatedAt', 'status', 'channel', 'type'],
    //   },
    // },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi2sk',
        composite: [],
      },
    },
  },
});
