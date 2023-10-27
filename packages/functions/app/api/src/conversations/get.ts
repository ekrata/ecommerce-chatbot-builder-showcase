import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import {
  ConversationItem,
  ExpandedConversation,
} from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { expandObjects } from '../util/expandObjects';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId, botId } = usePathParams();
    const { includeMessages } = useQueryParams();
    const expansionFields = JSON.parse(
      useQueryParam('expansionFields') ?? '[]',
    );
    if (!conversationId || !orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.conversations
        .get({ orgId, conversationId })
        .go();

      if (!res.data) {
        return {
          statusCode: 404,
          body: `No conversation with conversationId: ${conversationId} and orgId: ${orgId} exists. `,
        };
      }
      if (expansionFields?.length) {
        const expandedData = (
          await expandObjects(appDb, [res.data ?? {}], expansionFields)
        )[0] as ExpandedConversation;
        if (includeMessages) {
          const messagesRes = await appDb.entities.messages.query
            .byConversation({
              orgId,
              conversationId: expandedData.conversationId,
            })
            .go();

          const conversationItem: ConversationItem = {
            ...(expandedData as ExpandedConversation),
            messages: messagesRes.data,
          };
          return {
            statusCode: 200,
            body: JSON.stringify(conversationItem),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(expandedData),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
