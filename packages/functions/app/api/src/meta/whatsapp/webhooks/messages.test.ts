import crypto from 'crypto';
import { Api } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { setTimeout } from 'timers/promises';
import { beforeAll, describe, expect, it } from 'vitest';

import { getAppDb } from '../../../db';
import { getHttp } from '../../../http';
import mockOrgIds from '../../../util/mockOrgIds.json';
import { whatsappMessagesMock1, whatsappMessagesMock2 } from '../mocks';

const http = getHttp(`${Api.appApi.url}`);
const appDb = getAppDb(
  process?.env?.SST_Config_REGION,
  process.env.VITEST_TABLE,
);

console.log(process?.env?.VITEST_META_VERIFY_SECRET);

var expectedHash = crypto
  .createHmac('sha256', process?.env?.VITEST_META_VERIFY_SECRET)
  .update('buf')
  .digest('hex');

// let mockOrgIds: MockOrgIds[] = [];

// beforeAll(async () => {
//   mockOrgIds = (await http.post(`/util/small-seed-test-db`))
//     .data as MockOrgIds[];
//   if (!mockOrgIds) {
//     throw new Error('Mock Organisation undefined');
//   }
// });

describe('metaWhatsapp: tests whatsapp webhook handlers', async () => {
  const whatsappOrgPhoneId =
    whatsappMessagesMock1.value.metadata.phone_number_id;
  const customerWhatsappPhoneId =
    whatsappMessagesMock1.value.messages?.[0]?.from;

  it('creates a new customer, conversation, and message', async () => {
    // this will return before sns message is put onto queue, processed and then actioned
    await http.post(
      '/meta/whatsapp/webhook',
      JSON.stringify(whatsappMessagesMock1),
      { headers: { 'X-Hub-Signature-256': `sha256=${expectedHash}` } },
    );

    console.log(mockOrgIds);

    const org = (
      await appDb.entities.orgs
        .get({
          orgId: mockOrgIds?.[0]?.orgId,
        })
        .go()
    )?.data;

    console.log(org);

    expect(org?.whatsappPhoneId).toEqual(whatsappOrgPhoneId);
    const customer = (
      await appDb.entities.customers
        .get({
          customerId: customerWhatsappPhoneId,
          orgId: org?.orgId ?? '',
        })
        .go()
    )?.data;

    console.log(customer);

    const conversation = (
      await appDb.entities.conversations
        .get({
          conversationId: customerWhatsappPhoneId,
          orgId: customer?.orgId ?? '',
        })
        ?.go()
    )?.data;

    console.log(conversation);

    // is assigned to conversation
    expect(conversation?.customerId).toEqual(customer?.customerId);

    // conversation created with customer's whatsapp phone id
    expect(conversation?.conversationId).toEqual(customerWhatsappPhoneId);

    // customer has whatsappConversationId set to the same id as
    expect(customer?.whatsappConversationId).toEqual(customerWhatsappPhoneId);

    const message = (
      await appDb.entities.messages
        .get({
          messageId: whatsappMessagesMock2.value.messages?.[0]?.id,
          orgId: conversation?.orgId ?? '',
          conversationId: conversation?.conversationId ?? '',
        })
        ?.go()
    ).data;

    console.log(message);

    expect(message?.whatsappMessageId).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.id,
    );
    expect(message?.content).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.text?.body,
    );
    expect(message?.sentAt).toEqual(
      parseInt(whatsappMessagesMock2.value.messages?.[0]?.timestamp, 10),
    );
    expect(message?.customerId).toEqual(customer?.customerId);
    expect(message?.conversationId).toEqual(conversation?.conversationId);
  });

  it('creates a message, as customer and conversation for this whatsapp phone id are already created', async () => {
    // this will return before sns message is put onto queue, processed and then actioned
    await http.post(
      '/meta/whatsapp/webhook',
      JSON.stringify(whatsappMessagesMock2),
      { headers: { 'X-Hub-Signature-256': `sha256=${expectedHash}` } },
    );

    const org = (
      await appDb.entities.orgs.get({ orgId: mockOrgIds?.[0]?.orgId }).go()
    )?.data;

    const customer = await appDb.entities.customers
      .get({
        customerId: customerWhatsappPhoneId,
        orgId: mockOrgIds?.[0]?.orgId,
      })
      .go();

    expect(customer).toBeDefined();
    expect(customer?.data?.customerId).toEqual(customerWhatsappPhoneId);

    const conversation = (
      await appDb.entities.conversations
        .get({
          conversationId: customerWhatsappPhoneId ?? '',
          orgId: org?.orgId ?? '',
        })
        .go()
    )?.data;

    expect(conversation?.conversationId).toEqual(customerWhatsappPhoneId);
    expect(conversation?.orgId).toEqual(org?.orgId);
    expect(conversation?.customerId).toEqual(customer?.data?.customerId);

    const message = (
      await appDb.entities.messages
        .get({
          messageId: whatsappMessagesMock2.value.messages?.[0]?.id,
          orgId: conversation?.orgId ?? '',
          conversationId: conversation?.conversationId ?? '',
        })
        ?.go()
    ).data;

    expect(message?.messageId).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.id,
    );
    expect(message?.content).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.text?.body,
    );
    expect(message?.sentAt).toEqual(
      parseInt(whatsappMessagesMock2.value.messages?.[0]?.timestamp, 20),
    );
    expect(message?.customerId).toEqual(customer?.data?.customerId);
    expect(message?.conversationId).toEqual(conversation?.conversationId);
  });
});
