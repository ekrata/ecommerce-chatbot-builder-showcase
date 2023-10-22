import { SNSEvent } from 'aws-lambda';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { CreateBot } from '../../../../../../../stacks/entities/entities';
import { getAppDb } from '../../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SNSEvent) => {
  const records: any[] = event.Records;
  console.log(records);
  const { orgId, botId } = usePathParams();
  const body: CreateBot = useJsonBody();
  if (!orgId || !botId) {
    return {
      statusCode: 422,
      body: 'Failed to parse an id from the url.',
    };
  }

  try {
    delete body?.botId;
    const res = await appDb.entities.bots
      .create({
        ...body,
        nodes: body.nodes?.map((node) => ({
          ...node,
          data: JSON.stringify(node.data),
        })),
        orgId,
        botId,
      })
      .go();
    return {
      statusCode: 200,
      body: JSON.stringify(res.data),
    };
  } catch (err) {
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
});
