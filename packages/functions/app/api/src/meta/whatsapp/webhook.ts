import AWS from 'aws-sdk';
import crypto from 'crypto';
import {
  ApiHandler,
  useHeaders,
  useJsonBody,
  useQueryParam,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { Topic } from 'sst/node/topic';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { MessengerEvent, MetaEvent } from '../metaEvents';
import { verifyMetaRequestSignature } from '../verifyMetaRequestSignature';

// import { verifyMetaRequestSignature } from './verifyMetaRequestSignature';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

const sns = new AWS.SNS();

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
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
        }
      } else {
        const res = verifyMetaRequestSignature();
        if (res && body?.field) {
          switch (body?.field) {
            case MetaEvent.WhatsappMessages: {
              return await sns
                .publish({
                  // Get the topic from the environment variable
                  TopicArn: Topic.MetaWhatsappTopic.topicArn,
                  Message: JSON.stringify(body),
                  MessageAttributes: {
                    type: {
                      DataType: 'String',
                      StringValue: MetaEvent.WhatsappMessages,
                    },
                  },
                  MessageStructure: 'string',
                })
                .promise();
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
