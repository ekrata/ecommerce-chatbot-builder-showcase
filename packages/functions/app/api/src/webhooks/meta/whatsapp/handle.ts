import { ApiHandler, useJsonBody, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../../db';
import { verifyMetaRequestSignature } from '../verifyMetaRequestSignature';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    // Parse the query params
    let mode = useQueryParam('hub.mode');
    let token = useQueryParam('hub.verify_token');
    let challenge = useQueryParam('hub.challenge');
    const body = useJsonBody();

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === Config.META_VERIFY_SECRET) {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        return { statusCode: 200, body: challenge };
      } else {
          const res = verifyMetaRequestSignature();
          if(res) {
            return res
          }
          if(body?.id) {
            if(body?.messages) {
            }
            if(body?.messaging) {
              body?.messaging.map()
            }
          }
        }
        // Respond with '403 Forbidden' if verify tokens do not match
        return { statusCode: 403, body: '' };
      }
    }
  }),
);