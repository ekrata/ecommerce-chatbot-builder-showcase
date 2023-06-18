import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Config } from 'sst/node/config';
import { getAppDb } from '../db';
import { Table } from 'sst/node/table';
import { ExpandableField, expandObjects } from '../util/expandObjects';
import {
  ConversationItem,
  ExpandedConversation,
} from '@/entities/conversation';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const { operatorId, cursor, customerId, includeMessages } =
      useQueryParams();
    const expansionFields: ExpandableField[] = JSON.parse(
      useQueryParam('expansionFields') ?? '[]'
    );
    if (!orgId || (!operatorId && !customerId)) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      if (operatorId) {
        const res = await appDb.entities.conversations.query
          .assigned({ orgId, operatorId })
          .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
        if (expansionFields?.length) {
          const expandedData: ExpandedConversation[] = (await expandObjects(
            appDb,
            res.data,
            expansionFields as unknown as ExpandableField[]
          )) as ExpandedConversation[];

          if (includeMessages) {
            const conversationItems = await Promise.all(
              expandedData.map(async (item) => {
                const messagesRes = await appDb.entities.messages.query
                  .byConversation({
                    orgId,
                    conversationId: item.conversationId,
                  })
                  .go();

                const conversationItem: ConversationItem = {
                  conversation: item,
                  messages: messagesRes.data,
                };

                return conversationItem;
              })
            );
            return {
              statusCode: 200,
              body: JSON.stringify({
                cursor: res?.cursor,
                data: conversationItems,
              }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify({ cursor: res?.cursor, data: expandedData }),
          };
        } else
          return {
            statusCode: 200,
            body: JSON.stringify(res),
          };
      } else if (customerId) {
        const res = await appDb.entities.conversations.query
          .byCustomer({ orgId, customerId })
          .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
        if (expansionFields) {
          const expandedData: ExpandedConversation[] = (await expandObjects(
            appDb,
            res.data,
            expansionFields as unknown as ExpandableField[]
          )) as ExpandedConversation[];
          if (includeMessages) {
            const conversationItems = await Promise.all(
              expandedData.map(async (item) => {
                const messagesRes = await appDb.entities.messages.query
                  .byConversation({
                    orgId,
                    conversationId: item.conversationId,
                  })
                  .go();

                const conversationItem: ConversationItem = {
                  conversation: item,
                  messages: messagesRes.data,
                };

                return conversationItem;
              })
            );
            return {
              statusCode: 200,
              body: JSON.stringify({
                cursor: res?.cursor,
                data: conversationItems,
              }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify({ cursor: res?.cursor, data: expandedData }),
          };
        } else
          return {
            statusCode: 200,
            body: JSON.stringify(res),
          };
      }
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  })
);
