import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { ExpandedConversation } from '@/entities/conversation';
import * as Sentry from '@sentry/serverless';

import { UpdateConversation } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';
import { expandObjects } from '../util/expandObjects';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // createdAt,
      ...updateConversation
    }: UpdateConversation = useJsonBody();

    if (!orgId || !conversationId || !updateConversation) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const res = await appDb.entities.conversations
        .patch({
          orgId,
          conversationId,
        })
        .set({ ...updateConversation })
        .go({ response: 'all_new' });

      const expandedData = (
        await expandObjects(
          appDb,
          [res?.data ?? {}],
          ['customerId', 'operatorId'],
        )
      )[0] as ExpandedConversation;
      return {
        statusCode: 200,
        body: JSON.stringify(expandedData),
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
