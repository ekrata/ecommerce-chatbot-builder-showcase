import { Action } from 'aws-cdk-lib/aws-ec2';
import { Condition } from 'aws-cdk-lib/aws-stepfunctions';
import { AxiosError } from 'axios';
import { EntityItem } from 'electrodb';
import { writeFile } from 'fs';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';

import { Bot, BotEdgeType, BotNodeType } from '@/entities/bot';

import { CreateBot } from '../../../../../../stacks/entities/entities';
import { VisitorBotInteractionTrigger } from '../bots/triggers/definitions.type';
import { getHttp } from '../http';
import { MockOrgIds } from '../util';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/small-seed-test-db`))
    .data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe.concurrent('/bots', async () => {
  it('gets a bot', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = botIds[0];
    const res = await http.get(`/orgs/${orgId}/bots/${botId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.botId).toEqual(botId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it.only('lists bots by org', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = botIds[0];
    const res = await http.get(`/orgs/${orgId}/bots`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res?.data).toBeTruthy();
    botIds.map((botId: string) => {
      res?.data.forEach((bot: EntityItem<typeof Bot>) => {
        expect(botIds.includes(bot?.botId)).toBeTruthy();
      });
    });

    // save a mock bots object for frontend use
    writeFile('./mocks/bots.json', JSON.stringify(res.data), 'utf8', () => {
      expect(true).toEqual(true);
    });
  });
  it('creates a bot', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = uuidv4();
    const nodes: BotNodeType[] = [
      {
        id: '1',
        type: VisitorBotInteractionTrigger.VisitorClicksBotsButton,
        data: '',
        position: { x: 0, y: 50 },
      },
      {
        id: '2',
        type: Condition.ChatStatus,
        data: '',
        position: { x: -200, y: 200 },
      },
      {
        id: '3',
        type: Action.SendAChatMessage,
        data: '',
        position: { x: 200, y: 200 },
      },
    ];
    const edges: BotEdgeType[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
      },
    ];
    const data: CreateBot = {
      botId,
      orgId,
      category: 'General',
      nodes,
      edges,
    };

    // validate creation api
    const res = await http.post(`/orgs/${orgId}/bots/${botId}`, data);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toBeTruthy();
    expect(res.data?.botId).toEqual(botId);
    expect(res.data?.orgId).toEqual(orgId);
  });
  it('updates the nodes and edges of a bot', async () => {
    const { orgId, botIds } = mockOrgIds[0];
    const botId = botIds[0];

    // Get prexisting data for patch
    const prepareRes = await http.get(`/orgs/${orgId}/bots/${botId}`);
    expect(prepareRes).toBeTruthy();
    expect(prepareRes.status).toBe(200);

    // patch
    const { data } = prepareRes;
    const nodes: BotNodeType[] = [
      {
        id: '1',
        nodeType: 'trigger',
        nodeSubType: VisitorBotInteractionTrigger.VisitorClicksBotsButton,
        position: { x: 0, y: 50 },
      },
      {
        id: '2',
        nodeType: 'condition',
        nodeSubType: Condition.Day,
        position: { x: -200, y: 200 },
      },
      {
        id: '3',
        nodeType: 'action',
        nodeSubType: Action.AskAQuestion,
        position: { x: 200, y: 200 },
      },
    ];
    const edges: BotEdgeType[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
      },
    ];
    delete data?.orgId;
    const res = await http.patch(`/orgs/${orgId}/bots/${botId}`, {
      ...data,
      nodes,
      edges,
    });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // Validate patch with get
    const getRes = await http.get(`/orgs/${orgId}/bots/${botId}`);

    expect(getRes).toBeTruthy();
    expect(getRes.status).toBe(200);
    expect(getRes.data).toBeTruthy();
    expect(getRes.data?.botId).toEqual(botId);
    expect(getRes.data?.orgId).toEqual(orgId);
    expect(getRes.data?.nodes).toEqual(nodes);
    expect(getRes.data?.edges).toEqual(edges);
  });
  it('deletes a bot', async () => {
    const { orgId, botIds } = mockOrgIds?.[0];
    const botId = botIds[1];

    const res = await http.delete(`/orgs/${orgId}/bots/${botId}`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);

    // validate it doesn't exist anymore
    try {
      await http.get(`/orgs/${orgId}/bots/${botId}`);
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as AxiosError).response?.status).toBe(404);
    }
  });
});
