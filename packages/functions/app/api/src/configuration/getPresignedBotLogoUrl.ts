import { ApiHandler, usePathParams } from 'sst/node/api';
import { Bucket } from 'sst/node/bucket';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as Sentry from '@sentry/serverless';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    const { orgId } = usePathParams();

    if (!orgId) {
      return {
        statusCode: 422,
        body: 'Failed to parse an id from the url.',
      };
    }

    try {
      const command = new PutObjectCommand({
        ACL: 'public-read',
        Key: `${orgId}-botLogo`,
        Bucket: Bucket['echat-app-assets'].bucketName,
      });
      const url = await getSignedUrl(new S3Client({}), command);
      return {
        statusCode: 200,
        body: JSON.stringify({ url: url }),
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
