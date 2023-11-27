import crypto from 'node:crypto';
import { useHeader } from 'sst/node/api';
import { Config } from 'sst/node/config';

import * as Sentry from '@sentry/serverless';

export const verifyMetaRequestSignature = () => {
  try {
    const signature = useHeader('x-hub-signature-256');

    if (!signature) {
      return {
        statusCode: 403,
        body: JSON.stringify(`Couldn't find "x-hub-signature-256" in headers.`),
      };
    } else {
      var elements = signature.split('=');
      var signatureHash = elements[1];
      var expectedHash = crypto
        .createHmac('sha256', Config.META_VERIFY_SECRET)
        .update('buf')
        .digest('hex');

      if (signatureHash != expectedHash) {
        return {
          statusCode: 403,
          body: JSON.stringify("Couldn't validate the request signature."),
        };
      } else {
        return true;
      }
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
