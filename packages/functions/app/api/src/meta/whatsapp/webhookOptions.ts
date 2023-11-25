import AWS from 'aws-sdk';
import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { getAppDb } from '../../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

const sns = new AWS.SNS();

export const handler = ApiHandler(async () => {
  return {
    body: '',
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': Config.ALLOWED_ORIGINS,
      'Access-Control-Allow-Credentials': true,
    },
  };
});
