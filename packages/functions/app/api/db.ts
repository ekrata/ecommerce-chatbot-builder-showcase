import { Service } from 'electrodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Table } from 'sst/node/table';
import { Conversation } from '../../../../stacks/entities/conversation';
import { Customer } from '../../../../stacks/entities/customer';
import { Message } from '../../../../stacks/entities/message';
import { Operator } from '../../../../stacks/entities/operator';
import { Org } from '../../../../stacks/entities/org';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const appDb = new Service(
  {
    conversations: Conversation,
    customers: Customer,
    operators: Operator,
    messages: Message,
    orgs: Org,
  },
  { client, table: Table.app.tableName }
);
