import { writeFile } from 'fs';
import { camelCase } from 'lodash';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { UpdateBot } from '../../../../../../stacks/entities/entities';
import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId, botId } = usePathParams();
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // createdAt,
      ...updateBot
    }: UpdateBot = useJsonBody();

    delete updateBot?.createdAt;
    delete updateBot?.updatedAt;
    if (!orgId || !botId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      console.log('innn');
      const res = await appDb.entities.bots
        .update({
          orgId,
          botId,
        })
        .set({
          ...updateBot,
          nodes: updateBot.nodes?.map((node) => ({
            ...node,
            data: JSON.stringify(node.data),
          })),
          edges: updateBot.edges?.map((edge) => ({
            ...edge,
            data: JSON.stringify(edge.data),
          })),
        })
        .go({ response: Config.STAGE === 'local' ? 'all_new' : 'default' });

      // save name to botDump locally. move to templates folder to be a template
      if (Config.STAGE === 'local') {
        console.log('hihihi');
        console.log(res?.data);
        const name = res?.data?.name ?? res?.data?.botId;
        if (name) {
          const path = `packages/functions/app/api/src/bots/botDump/${camelCase(
            name,
          )}.json`;
          console.log(path);
          writeFile(path, JSON.stringify(res?.data), () => {});
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify(res?.data),
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
