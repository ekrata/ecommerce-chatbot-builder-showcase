import { SSTConfig } from 'sst';

import {
    articleContentsStack
} from './packages/functions/app/api/src/article-contents/articleContentsStack';
import { articlesStack } from './packages/functions/app/api/src/articles/articlesStack';
import { botsStack } from './packages/functions/app/api/src/bots/botsStack';
import {
    configurationStack
} from './packages/functions/app/api/src/configuration/configurationStack';
import {
    conversationsStack
} from './packages/functions/app/api/src/conversations/conversationsStack';
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
      region: 'us-east-1',
    };
  },
  stacks(app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }
    app.stack(paramStack)
    app.stack(baseStack)
    app.stack(articlesStack)
    app.stack(orgsStack)
    app.stack(configurationStack)
    app.stack(conversationsStack)
    app.stack(messagesStack)
    app.stack(articleContentsStack)
    app.stack(operatorsStack)
    app.stack(customersStack)
    app.stack(translationsStack)
    app.stack(visitsStack)
    app.stack(webhooksStack)
    app.stack(botsStack)
    app.stack(interactionsStack);
  },
} satisfies SSTConfig;
