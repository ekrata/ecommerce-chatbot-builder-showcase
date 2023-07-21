import { EntityItem } from 'electrodb';
import { ApiHandler, usePathParams, useQueryParam, useQueryParams } from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import {
    Conversation, ConversationChannel, ConversationItem, ConversationStatus, ConversationTopic,
    ExpandedConversation
} from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';
import { ExpandableField, expandObjects } from '../util/expandObjects';

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
    topic,
  } = params;
  try {
    // let res: {
    //   data: EntityItem<typeof Conversation>[];
    //   cursor: string | null;
    // } = { cursor: null, data: [] };

    let data: EntityItem<typeof Conversation>[] = [];
    const messages = await appDb.entities.messages.query
      .byOrg({ orgId })
      .go(
        cursor
          ? { cursor, limit: 100, order: 'desc' }
          : { limit: 100, order: 'desc' },
      );

    const newCursor = messages.cursor;
    // make distinct per conversationId
    const uniqueMessages = [
      ...new Map(
        messages.data.map((item) => [item.conversationId, item]),
      ).values(),
    ];

    const conversations = appDb.entities.conversations
      .get(
        uniqueMessages.map(({ orgId, conversationId }) => ({
          orgId,
          conversationId,
        })),
      )
      .go();

    if (operatorId) {
      data = (await conversations).data.filter(
        (conversation) =>
          conversation?.orgId === orgId &&
          conversation?.operatorId === operatorId,
      );
    } else if (customerId) {
      data = (await conversations).data.filter(
        (conversation) =>
          conversation?.orgId === orgId &&
          conversation?.customerId === customerId &&
          (status ? conversation.status === status : true) &&
          (channel ? conversation.channel === channel : true),
      );
    } else if (orgId) {
      data = (await conversations).data.filter(
        (conversation) =>
          conversation?.orgId === orgId &&
          (status ? conversation.status === status : true) &&
          (channel ? conversation.channel === channel : true) &&
          (topic ? conversation.topic === topic : true),
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
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
