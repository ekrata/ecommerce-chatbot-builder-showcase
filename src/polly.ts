import path from 'path';
import { setupPolly } from 'setup-polly-jest';
import { Polly, PollyConfig } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FetchAdapter from '@pollyjs/adapter-fetch';
import LocalStoragePersister from '@pollyjs/persister-local-storage';

Polly.register(FetchAdapter);
Polly.register(LocalStoragePersister);

let recordIfMissing = true;
let mode: PollyConfig['mode'] = 'replay';

switch (process.env.POLLY_MODE) {
  case 'record':
    mode = 'record';
    break;
  case 'replay':
    mode = 'replay';
    break;
  case 'offline':
    mode = 'replay';
    recordIfMissing = false;
    break;
  default:
    mode = 'replay';
    break;
}

export default function autoSetupPolly() {
  /**
   * This persister can be adapted for both Node.js and Browser environments.
   *
   * TODO: Customize your config.
   */
  return setupPolly({
    // 🟡 Note: In node, most `fetch` like libraries use the http/https modules.
    // `node-fetch` is handled by `NodeHttpAdapter`, NOT the `FetchAdapter`.
    adapters: ['fetch'],
    mode,
    recordIfMissing,
    flushRequestsOnStop: true,
    logging: false,
    recordFailedRequests: true,
    persister: 'local-storage',
    // persisterOptions: {
    //   fs: {
    //     recordingsDir: path.resolve(__dirname, '../../__recordings__'),
    //   },
    // },
  });
}
