import { SSTConfig } from 'sst';
import { dbStack } from 'stacks/dbStack';

import { articleContentsStack } from './packages/functions/app/api/src/article-contents/articleContentsStack';
import { articlesStack } from './packages/functions/app/api/src/articles/articlesStack';
import { botsStack } from './packages/functions/app/api/src/bots/botsStack';
import { configurationStack } from './packages/functions/app/api/src/configuration/configurationStack';
import { conversationsStack } from './packages/functions/app/api/src/conversations/conversationsStack';
import { customersStack } from './packages/functions/app/api/src/customers/customersStack';
import { interactionsStack } from './packages/functions/app/api/src/interactions/interactionsStack';
import { messagesStack } from './packages/functions/app/api/src/messages/messagesStack';
import { operatorsStack } from './packages/functions/app/api/src/operators/operatorsStack';
import { orgsStack } from './packages/functions/app/api/src/orgs/orgsStack';
import { translationsStack } from './packages/functions/app/api/src/translations/translationsStack';
import { visitsStack } from './packages/functions/app/api/src/visits/visitsStack';
import { webhooksStack } from './packages/functions/app/api/src/webhooks/webhooksStack';
import { baseStack } from './stacks/baseStack';
import { paramStack } from './stacks/paramStack';

export default {
  config(_input) {
    return {
      name: 'echat',
      region: 'ap-southeast-2',
    };
  },
  stacks(app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }
    app
      .stack(paramStack)
      .stack(dbStack)
      .stack(baseStack)
      .stack(articlesStack)
      .stack(orgsStack)
      .stack(configurationStack)
      .stack(conversationsStack)
      .stack(messagesStack)
      .stack(articleContentsStack)
      .stack(operatorsStack)
      .stack(customersStack)
      .stack(translationsStack)
      .stack(visitsStack)
      .stack(webhooksStack)
      .stack(botsStack)
      .stack(interactionsStack);
  },
} satisfies SSTConfig;
