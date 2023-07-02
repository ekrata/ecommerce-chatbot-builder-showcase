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
  ConversationChannel,
  ConversationItem,
  ConversationStatus,
  ConversationType,
  ExpandedConversation,
} from '@/entities/conversation';
import { stringMap } from 'aws-sdk/clients/backup';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();
    const params = {
      ...useQueryParams(),
      orgId,
    } as unknown as ConversationFilterParams;
    const {
      operatorId,
      cursor,
      customerId,
      includeMessages,
      updatedAt,
      status,
      channel,
      type,
    } = params;
    params.expansionFields = JSON.parse(
      useQueryParam('expansionFields') ?? '[]'
    );

    // minimum params
    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      return listConversations(params);
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  })
);

export interface ConversationFilterParams {
  orgId: string;
  expansionFields: ExpandableField[];
  cursor: string | undefined;
  includeMessages?: string;
  operatorId?: string;
  customerId?: string;
  updatedAt?: string;
  createdAt?: string;
  status?: string;
  channel?: string;
  type?: string;
}

export const listConversations = async (params: ConversationFilterParams) => {
  const {
    orgId,
    expansionFields,
    cursor,
    includeMessages,
    operatorId,
    customerId,
    updatedAt,
    createdAt,
    status,
    channel,
    type,
  } = params;
  try {
    if (operatorId) {
      const res = await appDb.entities.conversations.query
        .assigned({
          orgId,
          operatorId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
          type: type as ConversationType,
        })
        .gte({
          updatedAt: new Date(updatedAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
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
        .byCustomer({
          orgId,
          customerId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
          type: type as ConversationType,
        })
        .gte({
          updatedAt: new Date(updatedAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
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
    } else if (orgId) {
      const res = await appDb.entities.conversations.query
        .byOrg({
          orgId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
          type: type as ConversationType,
        })
        .gte({
          updatedAt: new Date(updatedAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
        .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
      if (expansionFields) {
        console.log(res.data);
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
};
