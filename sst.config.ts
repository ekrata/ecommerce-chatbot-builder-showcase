import { articleContentsStack } from 'packages/functions/app/api/src/article-contents/articleContentsStack';
import { articlesStack } from 'packages/functions/app/api/src/articles/articlesStack';
import { configurationStack } from 'packages/functions/app/api/src/configuration/configurationStack';
import { conversationsStack } from 'packages/functions/app/api/src/conversations/conversationsStack';
import { customersStack } from 'packages/functions/app/api/src/customers/customersStack';
import { messagesStack } from 'packages/functions/app/api/src/messages/messagesStack';
import { operatorsStack } from 'packages/functions/app/api/src/operators/operatorsStack';
import { orgsStack } from 'packages/functions/app/api/src/orgs/orgsStack';
import { translationsStack } from 'packages/functions/app/api/src/translations/translationsStack';
import { visitsStack } from 'packages/functions/app/api/src/visits/visitsStack';
import { SSTConfig } from 'sst';

import { BaseStack } from './stacks/BaseStack';

export default {
  config(_input) {
    return {
      name: 'eChat',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }
    app
      .stack(BaseStack)
      .stack(articlesStack)
      .stack(orgsStack)
      .stack(configurationStack)
      .stack(conversationsStack)
      .stack(messagesStack)
      .stack(articleContentsStack)
      .stack(operatorsStack)
      .stack(customersStack)
      .stack(translationsStack)
      .stack(visitsStack);
  },
} satisfies SSTConfig;
