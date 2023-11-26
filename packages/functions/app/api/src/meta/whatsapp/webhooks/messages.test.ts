import { Api } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { getAppDb } from '../../../db';
import { getHttp } from '../../../http';
import { MockOrgIds } from '../../../util';
import { whatsappMessagesMock1, whatsappMessagesMock2 } from '../mocks';

const http = getHttp(`${Api.appApi.url}`);
const appDb = getAppDb(Config.REGION, Table.app.tableName);

let mockOrgIds: MockOrgIds[] = [];
beforeAll(async () => {
  mockOrgIds = (await http.post(`/util/seed-test-db`)).data as MockOrgIds[];
  if (!mockOrgIds) {
    throw new Error('Mock Organisation undefined');
  }
});

describe('metaWhatsapp: tests whatsapp webhook handlers', () => {
  it('creates a new customer, conversation, and message', async () => {
    const whatsappOrgPhoneId =
      whatsappMessagesMock1.value.metadata.phone_number_id;
    const customerWhatsappPhoneId =
      whatsappMessagesMock1.value.messages?.[0]?.from;

    await http.post(
      '/meta/whatsapp/webhook',
      JSON.stringify(whatsappMessagesMock1),
    );

    const customer = await appDb.entities.customers.scan
      .where((customer, { eq }) =>
        eq(customer?.whatsappPhoneId, customerWhatsappPhoneId),
      )
      .go();

    const conversation = await appDb.entities.conversations
      .get({
        conversationId: customerWhatsappPhoneId,
        orgId: customer?.data?.[0]?.orgId,
      })
      ?.go();

    expect(conversation.data?.customerId).toEqual(customerWhatsappPhoneId);
    expect(conversation.data?.conversationId).toEqual(customerWhatsappPhoneId);
    expect(customer?.data?.[0]?.whatsappConversationId).toEqual(
      customerWhatsappPhoneId,
    );

    const message = await appDb.entities.messages
      .get({
        messageId: whatsappMessagesMock1.value.messages?.[0]?.id ?? '',
        conversationId: conversation.data?.conversationId ?? '',
        orgId: customer?.data?.[0]?.orgId,
      })
      ?.go();

    expect(message.data?.messageId).toEqual(
      whatsappMessagesMock1.value.messages?.[0]?.id,
    );
    expect(message.data?.content).toEqual(
      whatsappMessagesMock1.value.messages?.[0]?.text,
    );
    expect(message.data?.sentAt).toEqual(
      parseInt(whatsappMessagesMock1.value.messages?.[0]?.timestamp, 10),
    );
    expect(message.data?.customerId).toEqual(customer?.data?.[0]?.customerId);
  });
  it('creates a message, as customer and conversation for this whatsapp phone id are already created', async () => {
    const whatsappOrgPhoneId =
      whatsappMessagesMock1.value.metadata.phone_number_id;
    const customerWhatsappPhoneId =
      whatsappMessagesMock1.value.messages?.[0]?.from;
    const result = await http.post(
      '/meta/whatsapp/webhook',
      JSON.stringify(whatsappMessagesMock2),
    );

    // customer and conversation should be the same objects, so we can expect the id to equal the first mock ids
    const customer = await appDb.entities.customers.scan
      .where((customer, { eq }) =>
        eq(customer?.whatsappPhoneId, customerWhatsappPhoneId),
      )
      .go();

    const conversation = await appDb.entities.conversations
      .get({
        conversationId: customerWhatsappPhoneId,
        orgId: customer?.data?.[0]?.orgId,
      })
      ?.go();

    expect(conversation.data?.customerId).toEqual(customerWhatsappPhoneId);
    expect(conversation.data?.conversationId).toEqual(customerWhatsappPhoneId);
    expect(customer?.data?.[0]?.whatsappConversationId).toEqual(
      customerWhatsappPhoneId,
    );

    const message = await appDb.entities.messages
      .get({
        messageId: whatsappMessagesMock1.value.messages?.[0]?.id ?? '',
        conversationId: conversation.data?.conversationId ?? '',
        orgId: customer?.data?.[0]?.orgId,
      })
      ?.go();

    expect(message.data?.messageId).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.id,
    );
    expect(message.data?.content).toEqual(
      whatsappMessagesMock2.value.messages?.[0]?.text,
    );
    expect(message.data?.sentAt).toEqual(
      parseInt(whatsappMessagesMock2.value.messages?.[0]?.timestamp, 10),
    );
    expect(message.data?.customerId).toEqual(customer?.data?.[0]?.customerId);
  });
});
