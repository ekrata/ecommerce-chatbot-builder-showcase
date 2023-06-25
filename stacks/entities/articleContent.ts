import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

/**
 * Stores the actual content of an article.
 * @date 12/06/2023 - 17:08:29
 *
 * @type {*}
 */
export const ArticleContent = new Entity({
  model: {
    entity: 'articleContent',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    articleContentId: {
      type: 'string',
      required: true,
      default: () => uuidv4(),
    },
    articleId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    orgId: {
      type: 'string',
      required: true,
    },
    lang: {
      type: 'string',
      required: true,
      default: 'en',
    },
    content: {
      type: 'string',
      required: true,
      default: '',
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
        composite: ['orgId', 'articleContentId', 'lang'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOrg: {
      index: 'gsi2pk-gsi2sk-index',
      pk: {
        field: 'gsi2pk',
        composite: ['orgId', 'lang'],
      },
      sk: {
        field: 'gsi2sk',
        composite: [],
      },
    },
  },
});
