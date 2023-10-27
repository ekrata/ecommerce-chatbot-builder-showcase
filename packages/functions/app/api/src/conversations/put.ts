import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { createConversation } from 'widget/src/app/actions';

import * as Sentry from '@sentry/serverless';

import { CreateConversation } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const { orgId, conversationId } = usePathParams();
      const body: CreateConversation = useJsonBody();
      if (!orgId || !conversationId) {
        return {
          statusCode: 422,
          body: 'Failed to parse an id from the url.',
        };
      }
      const res = await appDb.entities.conversations
        .put({
          ...body,
          orgId,
          conversationId,
        })
        .go();
      console.log(res);
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      console.log(await err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
