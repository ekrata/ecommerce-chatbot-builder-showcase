import { Service } from 'electrodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Conversation } from '../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../stacks/entities/customer';
import { Message } from '../../../../../stacks/entities/message';
import { Operator } from '../../../../../stacks/entities/operator';
import { Visitor } from '../../../../../stacks/entities/visitor';
import { Translation } from '../../../../../stacks/entities/translation';
import { Org } from '../../../../../stacks/entities/org';
import { Configuration } from '../../../../../stacks/entities/configuration';

export const getAppDb = (region: string, tableName: string) =>
  new Service(
    {
      conversations: Conversation,
      customers: Customer,
      visitors: Visitor,
      configurations: Configuration,
      translations: Translation,
      operators: Operator,
      messages: Message,
      orgs: Org,
    },
    { client: new DynamoDBClient({ region }), table: tableName }
  );
