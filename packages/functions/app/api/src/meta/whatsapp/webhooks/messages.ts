import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { EntityItem } from 'electrodb';
import { c } from 'msw/lib/glossary-de6278a9';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { Conversation } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { SendAChatMessageData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/SendAChatMessage';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../../db';
import { MessagesBody } from '../types/messages';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      const { Records } = event;
      for (const record of Records) {
        const snsMessageId = record.messageId;
        const body = (record.body as unknown as SNSMessage)
          ?.Message as unknown as MessagesBody;

        const whatsappOrgPhoneId = body?.value?.metadata?.phone_number_id;

        const org = (
          await appDb.entities.orgs.query
            .whatsappId({ whatsappPhoneId: whatsappOrgPhoneId })
            .go()
        ).data?.[0];

        console.log('org', org);

        const customers = await appDb.entities.customers.scan
          .where((customer, { eq }) => {
            const res = body.value.messages
              .map(
                (message) => `${eq(customer?.whatsappPhoneId, message?.from)}`,
              )
              .join(` AND `);
            return res;
          })
          .go();

        console.log('cuss', customers);

        type BodyReduce = {
          customerRes: EntityItem<typeof Customer> | undefined | null;
          conversationRes: EntityItem<typeof Conversation> | undefined | null;
        };

        const res = await body?.value?.messages.reduce<
          Promise<Record<string, BodyReduce>>
        >(
          async (prev, message) => {
            // carry these through the reduce to prevent duplicate api calls
            // they are the same if message?.from is the same
            const prevResolved = await prev;
            let customerRes: EntityItem<typeof Customer> | undefined | null =
              prevResolved?.[message?.id]?.customerRes ??
              customers?.data?.find(
                (customer) => customer?.customerId === message?.from,
              );
            console.log('cusres', customerRes);
            let conversationRes:
              | EntityItem<typeof Conversation>
              | undefined
              | null = prevResolved[message?.id]?.conversationRes;

            // first message, customer won't exist.. create it
            if (!customerRes) {
              customerRes = (
                await appDb.entities.customers
                  .upsert({
                    // messageId based on idempotent interactionId
                    customerId: message?.from,
                    orgId: org?.orgId,
                    name:
                      body?.value.contacts.find(
                        (contact) => contact.wa_id === message?.from,
                      )?.profile?.name ?? '',
                    phone: message?.from,
                    omniChannelSource: 'whatsapp',
                    createdAt: Date.now(),
                  })
                  .go({ response: 'all_new' })
              )?.data;
            }

            console.log(1);
            // if there is already a whatsapp conversation
            console.log(customerRes?.whatsappConversationId);
            if (customerRes?.whatsappConversationId) {
              conversationRes = (
                await appDb.entities.conversations
                  .get({
                    conversationId: message?.from,
                    orgId: customerRes?.orgId,
                  })

                  .go()
              )?.data;
            }
            if (!conversationRes) {
              // else create one
              conversationRes = (
                await appDb.entities.conversations
                  .upsert({
                    // create conversation with same id as first message of convo
                    conversationId: message.from,
                    orgId: customerRes?.orgId,
                    operatorId: '',
                    customerId: customerRes?.customerId,
                    channel: 'whatsapp',
                    createdAt: parseInt(message?.timestamp, 10),
                    sentAt: parseInt(message?.timestamp, 10),
                  })
                  .go({ response: 'all_new' })
              )?.data;
            }

            console.log(2);

            console.log(conversationRes);

            // const messages1 = await appDb.entities.messages.query
            //   .byOrgConversation({
            //     orgId: conversationRes?.orgId,
            //     conversationId: conversationRes?.conversationId,
            //   })
            //   .where((messageIteration, { eq }) =>
            //     eq(messageIteration?.messageId, message.id),
            //   )

            //   ?.go();
            // console.log(messages1);
            // finally, create the messages
            const res = await appDb.entities.messages
              .upsert({
                // messageId based on idempotent interactionId
                messageId: message?.id,
                conversationId: conversationRes?.conversationId,
                orgId: conversationRes?.orgId,
                operatorId: '',
                customerId: customerRes?.customerId,
                sender: 'customer',
                content: message?.text?.body,
                createdAt: parseInt(message?.timestamp, 10),
                sentAt: parseInt(message?.timestamp, 10),
              })
              .go({ response: 'all_new' });

            // console.log(res);
            // const messages = await appDb.entities.messages.query
            //   .byOrgConversation({
            //     orgId: conversationRes?.orgId,
            //     conversationId: conversationRes?.conversationId,
            //   })
            //   .where((messageIteration, { eq }) =>
            //     eq(messageIteration?.whatsappMessageId, message.id),
            //   )
            //   ?.go();
            // console.log(messages);
            return {
              ...prev,
              [`${message?.from}`]: {
                customerRes,
                conversationRes,
              } as BodyReduce,
            };
          },
          {} as Promise<Record<string, BodyReduce>>,
        );
        return {
          statusCode: 200,
          body: 'Sent messages',
        };
      }
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  },
);

export const handler = middy(lambdaHandler).use(eventNormalizer());
