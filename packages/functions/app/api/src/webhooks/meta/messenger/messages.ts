import { ApiHandler, useJsonBody } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { createMetaConversationId } from './createMetaConversationId';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const body = useJsonBody();
      const orgRes = await appDb.entities.orgs.scan
        .where(
          ({ metaPageId }, { eq }) =>
            `${eq(metaPageId, body?.messaging?.recipient)}`,
        )
        .go();

      // generate meta conversation id from
      const generatedMetaConversationId = createMetaConversationId(
        body?.sender?.id,
        body?.recipient?.id,
      );

      // get conversation if it exists
      const conversation = await appDb.entities.conversations.scan
        .where(
          ({ metaConversationId }, { eq }) =>
            `${eq(metaConversationId, generatedMetaConversationId)}`,
        )
        .go();

      const customer = await appDb.entities.customers.scan
        .where(
          ({ metaSenderId }, { eq }) =>
            `${eq(metaSenderId, body?.messaging?.sender)}`,
        )
        .go();

      const conversationId = conversation?.data?.[0]?.conversationId;
      const customerId = customer.data?.[0]?.customerId;
      if (conversationId) {
        const message = await appDb.entities.messages
          .upsert({
            content: body?.message?.text,
            conversationId,
            orgId: orgRes?.data?.[0]?.orgId,
            sender: 'customer',
            customerId: customerId ?? '',
            operatorId: '',
            externalMetaId: body?.message?.mid,
            replyToMessageId: body?.message?.reply_to.mid,
            attachments: body?.message?.attachments,
          })
          .go();
      } else {
        const conversation = await appDb.entities.conversations
          .upsert({
            metaConversationId: generatedMetaConversationId,
            orgId: orgRes?.data?.[0]?.orgId,
            customerId: body?.sender?.id,
            channel: 'messenger',
          })
          .go();
        const message = await appDb.entities.messages
          .upsert({
            conversationId: conversation?.data?.conversationId,
            orgId: orgRes?.data?.[0]?.orgId,
            customerId: body?.sender?.id,
            content: body?.message?.text,
            sender: 'customer',
            operatorId: '',
            externalMetaId: body?.message?.mid,
            replyToMessageId: body?.message?.reply_to.mid,
            attachments: body?.message?.attachments,
          })
          .go();
        return { statusCode: 200, body: '' };
      }
    } catch (err) {
      return { statusCode: 500, body: err };
    }
  }),
);
