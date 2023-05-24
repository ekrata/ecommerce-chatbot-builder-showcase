import { Service } from 'electrodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Visitor } from '@/entities/visitor';
import { Config } from 'sst/node/config';
import { Conversation } from '../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../stacks/entities/customer';
import { Message } from '../../../../../stacks/entities/message';
import { Operator } from '../../../../../stacks/entities/operator';
import { Org } from '../../../../../stacks/entities/org';
import { Configuration } from '../../../../../stacks/entities/configuration';

const client = new DynamoDBClient({ region: Config.REGION });

export const appDb = (tableName: string) =>
  new Service(
    {
      conversations: Conversation,
      customers: Customer,
      visitors: Visitor,
      configurations: Configuration,
      operators: Operator,
      messages: Message,
      orgs: Org,
    },
    { client, table: tableName }
  );
