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
import { Message } from '@/entities/message';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import {
  ExpandableField,
  expandableField,
  expandObjects,
} from '../util/expandObjects';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

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
    params.expansionFields = (useQueryParam('expansionFields')?.split(',') ??
      []) as ['customerId', 'operatorId'];

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
  includeMessages?: boolean;
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
    // includeMessages,
    operatorId,
    customerId,
    updatedAt,
    createdAt,
    status,
    channel,
    topic,
  } = params;
  try {
    // let res: {
    //   data: EntityItem<typeof Conversation>[];
    //   cursor: string | null;
    // } = { cursor: null, data: [] };

    let data: EntityItem<typeof Conversation>[] = [];
    let messages: {
      cursor: string | null;
      data: EntityItem<typeof Message>[];
    } = {
      cursor: null,
      data: [],
    };
    console.log('hi');
    console.log(params);
    const conversations = await appDb.entities.conversations.query
      .byOrg({ orgId })
      .where(({ customerId }, { eq }) =>
        customerId != null && params?.customerId != null
          ? eq(customerId, params?.customerId)
          : '',
      )
      .where(({ operatorId }, { eq }) =>
        operatorId != null && params?.operatorId! + null
          ? eq(operatorId, params?.operatorId)
          : '',
      )
      .where(({ status }, { eq }) =>
        params?.status != null && status != null
          ? eq(status, params?.status)
          : '',
      )
      .where(({ channel }, { eq }) =>
        params?.channel != null && channel != null
          ? eq(channel, params?.channel)
          : '',
      )
      .where(({ topic }, { eq }) =>
        topic != null && params?.topic != null ? eq(topic, params?.topic) : '',
      )
      .go(
        cursor
          ? { cursor: cursor, limit: 10, order: 'desc' }
          : { limit: 10, order: 'desc' },
      );
    const newCursor = messages.cursor;
    console.log(conversations);
    // make distinct per conversationId

    // const conversations = await appDb.entities.conversations
    //   .get(
    //     uniqueMessages.map(({ orgId, conversationId }) => ({
    //       orgId,
    //       conversationId,
    //     })),
    //   )
    //   .go({ preserveBatchOrder: true });

    console.log('conversations', conversations);

    if (params.includeMessages) {
      data = await Promise.all(
        conversations?.data?.map(async (conversation) => {
          const messages = await appDb.entities.messages.query
            .byOrgConversation({
              orgId,
              conversationId: conversation.conversationId,
            })
            .go({ limit: 500, order: 'asc' });
          return { ...conversation, messages: messages.data };
        }),
      );
    }
    if (data.length && expansionFields?.length) {
      const expandedData: ExpandedConversation[] = (await expandObjects(
        appDb,
        data,
        expansionFields as unknown as ExpandableField[],
      )) as ExpandedConversation[];

      return {
        statusCode: 200,
        body: JSON.stringify({ cursor: newCursor, data: expandedData }),
      };
    } else
      return {
        statusCode: 200,
        body: JSON.stringify({ cursor: newCursor, data }),
      };
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
