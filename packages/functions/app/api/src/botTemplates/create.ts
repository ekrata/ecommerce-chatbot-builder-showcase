import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { CreateBot } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, botId } = usePathParams();
    const body: CreateBot = useJsonBody();
    if (!orgId || !botId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const res = await appDb.entities.botTemplates
        .create({
          ...body,
          nodes: body.nodes?.map((node) => ({
            ...node,
            data: JSON.stringify(node.data),
          })),
          edges: body.edges?.map((edge) => ({
            ...edge,
            data: JSON.stringify(edge.data),
          })),
          botTemplateId: botId,
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
  }),
);
