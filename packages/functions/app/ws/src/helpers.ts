import { SQSRecord, StreamRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

export const getNewImage = (record: SQSRecord) => {
  const streamRecord = (
    record?.body as unknown as { Message: { dynamodb: StreamRecord } }
  )?.Message?.dynamodb;
  return streamRecord?.NewImage;
};
