import { DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const deleteTable = async () => {
  console.log('deleting table...');
  const command = new DeleteTableCommand({
    TableName: 'local-echat-app',
  });

  const response = await client.send(command);
  console.log(response);
  return response;
};

deleteTable();
