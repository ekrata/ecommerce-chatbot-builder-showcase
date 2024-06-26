import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import * as Sentry from '@sentry/serverless';
import { Table } from 'sst/node/table';
import { getAppDb } from '../db';
import { CreateConversation } from '../../../../../../stacks/entities/entities';
import { Config } from 'sst/node/config';
import { ExpandedConversation } from '@/entities/conversation';
import { ExpandableField, expandObjects } from '../util/expandObjects';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, conversationId } = usePathParams();
    const body: CreateConversation = useJsonBody();
    if (!orgId || !conversationId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }
    try {
      const res = await appDb.entities.conversations
        .create({
          ...body,
          orgId,
          conversationId,
        })
        .go();
      const expandedData: ExpandedConversation[] = (await expandObjects(
        appDb,
        [res.data],
        ['customerId', 'operatorId']
      )) as ExpandedConversation[];
      return {
        statusCode: 200,
        body: JSON.stringify(expandedData?.[0]),
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  })
);
