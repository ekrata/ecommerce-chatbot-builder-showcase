import { EntityItem } from 'electrodb';
import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import {
  Conversation,
  ConversationChannel,
  ConversationItem,
  ConversationStatus,
  ConversationTopic,
  ExpandedConversation,
} from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { ExpandableField, expandObjects } from '../util/expandObjects';

// @ts-ignore
const appDb = getAppDb(Config.REGION, Table.app.tableName); // eslint-disable-line

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const session = useSession();
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
    } = params;
    params.expansionFields = JSON.parse(
      useQueryParam('expansionFields') ?? '[]',
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
  }),
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
  status?: ConversationStatus;
  channel?: ConversationChannel;
  topic?: ConversationTopic;
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
  } = params;
  console.log('includeMessages', includeMessages);
  try {
    let res: {
      data: EntityItem<typeof Conversation>[];
      cursor: string | null;
    } = { cursor: null, data: [] };
    if (operatorId) {
      res = await appDb.entities.conversations.query
        .assigned({
          orgId,
          operatorId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
        })
        .gte({
          createdAt: new Date(createdAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
        .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
    } else if (customerId) {
      res = await appDb.entities.conversations.query
        .byCustomer({
          orgId,
          customerId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
        })
        .gte({
          createdAt: new Date(createdAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
        .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
    } else if (orgId) {
      res = await appDb.entities.conversations.query
        .byOrg({
          orgId,
          status: status as ConversationStatus,
          channel: channel as ConversationChannel,
        })
        .gte({
          createdAt: new Date(createdAt ?? 0).getTime(),
          // createdAt: new Date(createdAt ?? 0).getTime(),
        })
        .go(cursor ? { cursor, limit: 10 } : { limit: 10 });
    }
    if (res?.data?.length && expansionFields?.length) {
      const expandedData: ExpandedConversation[] = (await expandObjects(
        appDb,
        res.data,
        expansionFields as unknown as ExpandableField[],
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
              ...item,
              messages: messagesRes.data,
            };

            return conversationItem;
          }),
        );
        console.log(conversationItems);
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
  } catch (err) {
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
