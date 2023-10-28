import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { CreateMessage } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId, messageId } = usePathParams();
    const body: CreateMessage = useJsonBody();
    if (!orgId || !conversationId || !messageId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.messages
        .put({
          ...body,
          orgId,
          conversationId,
          messageId,
        })
        .go();
      console.log(res?.data);
      const conversationRes = await appDb.entities.conversations
        .update({
          ...body,
          orgId,
          conversationId,
        })
        .set({ lastMessageAt: res?.data?.createdAt })
        .go();
      console.log(conversationRes?.data);
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: err as string,
      };
    }
  }),
);
