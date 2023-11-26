import { SNSEvent, SNSEventRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { EntityItem } from 'electrodb';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { botNodeEvent, BotNodeType } from '@/entities/bot';
import { Conversation } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { SendAChatMessageData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/SendAChatMessage';
import middy from '@middy/core';
import eventNormalizer from '@middy/event-normalizer';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../../db';
import { Message, MessagesBody } from '../types/messages';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const lambdaHandler = Sentry.AWSLambda.wrapHandler(
  async (event: SQSEvent) => {
    try {
      const { Records } = event;
      for (const record of Records) {
        const snsMessageId = record.messageId;
        const body = (record.body as unknown as SNSMessage)
          ?.Message as unknown as MessagesBody;

        const whatsappPhoneId = body?.value?.metadata?.phone_number_id;

        const org = await appDb.entities.orgs.scan
          .where((org, { eq }) => eq(org?.whatsappPhoneId, whatsappPhoneId))
          .go({ limit: 1 });

        const customers = await appDb.entities.customers.scan
          .where((customer, { eq }) => {
            return body.value.messages
              .map((message) => {
                `${eq(customer?.whatsappPhoneId, message.from)}`;
              })
              .join(` AND `);
          })
          .go();

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
              prevResolved[message?.id].customerRes ??
              customers.data.find((customer) => {
                customer?.whatsappPhoneId === message.from;
              });
            let conversationRes:
              | EntityItem<typeof Conversation>
              | undefined
              | null = prevResolved[message?.id].conversationRes;

            // first message, customer won't exist.. create it
            if (!customerRes) {
              customerRes = (
                await appDb.entities.customers
                  .upsert({
                    // messageId based on idempotent interactionId
                    customerId: message?.from,
                    orgId: org?.data?.[0]?.orgId,
                    whatsappPhoneId: message?.from,
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

            // create a single conversation for this customer
            if (customerRes?.whatsappConversationId) {
              conversationRes = (
                await appDb.entities.conversations
                  .get({
                    conversationId: customerRes?.whatsappConversationId,
                    orgId: customerRes?.orgId,
                  })
                  .go()
              )?.data;
            } else {
              conversationRes = (
                await appDb.entities.conversations
                  .upsert({
                    // messageId based on idempotent interactionId
                    conversationId: message.from,
                    messageId: message.id,
                    orgId: customerRes?.orgId,
                    operatorId: '',
                    customerId: customerRes?.customerId,
                    createdAt: parseInt(message?.timestamp, 10),
                    sentAt: parseInt(message?.timestamp, 10),
                  })
                  .go({ response: 'all_new' })
              )?.data;

              await appDb.entities.customers
                .update({
                  customerId: customerRes?.customerId,
                  orgId: customerRes?.orgId,
                })
                .set({
                  whatsappConversationId: conversationRes?.conversationId,
                })
                .go({});
            }

            const res = await appDb.entities.messages
              .upsert({
                // messageId based on idempotent interactionId
                messageId: message.id,
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
