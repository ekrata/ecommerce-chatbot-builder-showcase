import AWS from 'aws-sdk';
import { ApiHandler, useJsonBody, useQueryParam } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { MessengerEvent } from '../metaEvents';
import { verifyMetaRequestSignature } from './verifyMetaRequestSignature';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

const sns = new AWS.SNS();

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
              Promise.all(body.messages?.map(async (message) => {
                return await  sns.publish({
                  // Get the topic from the environment variable
                  TopicArn: Topic.MetaMessengerTopic,
                  Message: JSON.stringify({ topic: MessengerEvent.Messages, payload: message }),
                  MessageStructure: "string",
                })
                .promise();
              }))

  console.log("Order confirmed!");

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
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
