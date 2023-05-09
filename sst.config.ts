import { SSTConfig } from 'sst';
import { AppStack } from './stacks/AppStack';

export default {
  config(_input) {
    return {
      name: 'crow',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    if (app.stage !== 'prod') {
      app.setDefaultRemovalPolicy('destroy');
    }
    app.stack(AppStack);
  },
} satisfies SSTConfig;
