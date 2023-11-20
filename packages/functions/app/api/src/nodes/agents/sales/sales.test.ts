import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { getHttp } from '../../../http';
import { MockOrgIds } from '../../../util';
import mockOrgIds from '../../../util/mockOrgIds.json';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
// let mockOrgIds: MockOrgIds[] = [];
// beforeAll(async () => {
//   mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
//   if (!mockOrgIds) {
//     throw new Error('Mock Organisation undefined');
//   }
// });

describe.concurrent(
  'sales',
  async () => {
    it('replies to a sales', async () => {
      const { orgId, customers } = mockOrgIds[0];
      // const messageId = faker.helpers.arrayElement(messageIds);
      let message = 'Hi, can you help me?';
      let conversationHistory = [];
      let res = await http.post(`/orgs/${orgId}/nodes/chatbots/sales-test`, {
        messages: ['Yes, what materials are you mattresses made from?'],
        conversationHistory: [],

        // 'Yes, I am looking for a queen sized mattress. Do you have any mattresses in queen size?',
        // 'Yea, compare and contrast those two options, please.',
        // "Great, thanks, that's it. I will talk to my wife and call back if she is onboard. Have a good day!",
      });
      console.log(res?.data);

      expect(res).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res?.data?.conversationStage).toEqual('1');
      expect(res?.data?.conversationHistory?.length).toEqual(2);

      conversationHistory = res?.data?.conversationHistory;

      // res = await http.post(`/orgs/${orgId}/nodes/chatbots/sales-test`, {
      //   messages: [
      //     // 'I am well, how are you? I would like to learn more about your mattresses.',
      //     'Yes, what materials are you mattresses made from?',
      //   ],
      //   // conversationHistory: res?.data?.conversationHistory,

      //   // 'Yes, I am looking for a queen sized mattress. Do you have any mattresses in queen size?',
      //   // 'Yea, compare and contrast those two options, please.',
      //   // "Great, thanks, that's it. I will talk to my wife and call back if she is onboard. Have a good day!",
      // });
      // console.log(res?.data);

      // expect(res).toBeTruthy();
      // expect(res.status).toBe(200);
      // expect(res?.data?.conversationStage).toEqual('3');
    });
  },
  { timeout: 10000000 },
);
