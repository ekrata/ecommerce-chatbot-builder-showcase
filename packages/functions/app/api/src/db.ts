import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Service } from 'electrodb';

import { Analytic } from '@/entities/analytics';
import { Bot } from '@/entities/bot';
import { BotTemplate } from '@/entities/botTemplate';
import { Interaction } from '@/entities/interaction';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Article } from '../../../../../stacks/entities/article';
import { ArticleContent } from '../../../../../stacks/entities/articleContent';
import { Configuration } from '../../../../../stacks/entities/configuration';
import { Conversation } from '../../../../../stacks/entities/conversation';
import { Customer } from '../../../../../stacks/entities/customer';
import { Message } from '../../../../../stacks/entities/message';
import { Operator } from '../../../../../stacks/entities/operator';
import { Org } from '../../../../../stacks/entities/org';
import { Translation } from '../../../../../stacks/entities/translation';
import { Visit } from '../../../../../stacks/entities/visit';

export const getAppDb = (region: string, tableName: string) =>
  new Service(
    {
      conversations: Conversation,
      customers: Customer,
      visits: Visit,
      configurations: Configuration,
      translations: Translation,
      operators: Operator,
      messages: Message,
      orgs: Org,
      bots: Bot,
      botTemplates: BotTemplate,
      interactions: Interaction,
      analytics: Analytic,
      articles: Article,
      articleContents: ArticleContent,
    },
    {
      client: new DynamoDB.DocumentClient({
        region,
        // maxRetries: 3,
        // httpOptions: {
        //   timeout: 5000,
        // },
      }),
      table: tableName,
    },
  );

export type AppDb = ReturnType<typeof getAppDb>;
