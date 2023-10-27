import { SQSRecord, StreamRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

export const getNewImage = (record: SQSRecord) => {
  const streamRecord = (record?.body as { Message: { dynamodb: StreamRecord } })
    .Message?.dynamodb as StreamRecord;
  const newImage = DynamoDB.Converter.unmarshall(streamRecord?.NewImage ?? {});
  return newImage;
};
