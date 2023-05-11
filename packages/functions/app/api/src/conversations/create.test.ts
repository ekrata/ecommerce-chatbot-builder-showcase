import { describe, it, expect } from 'vitest';
import { Config } from 'sst/node/config';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { CreateConversation } from '../../../../../../stacks/entities/entities';

// Seed db in vitest beforeAll, then use preexisitng ids

describe('create conversation', async () => {
  it(
    'creates 1 conversation',
    async () => {
      const data: CreateConversation = {
        orgId: uuidv4(),
        customerId: uuidv4(),
        status: 'unassigned',
        channel: 'live',
        type: 'chat',
      };
      const res = await fetch(`${Api.api.url}/conversations`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
    },
    { timeout: 10000 }
  );
});
