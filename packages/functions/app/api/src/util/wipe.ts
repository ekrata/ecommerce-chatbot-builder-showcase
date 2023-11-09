import { ApiHandler, useJsonBody } from 'sst/node/api';

import * as Sentry from '@sentry/serverless';

import { appDb } from '../../db';
import { MockOrgIds } from './';
import * as mockOrgIds from './mockOrgIds.json';

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const mockOrgIds: Partial<MockOrgIds>[] = useJsonBody();
      mockOrgIds.map((mockOrgItem) => {
        const {
          customers,
          lang,
          botIds,
          botTemplateIds,
          articleIds,
          mockGoogleAccountUserId,
          orgId,
          adminId,
          operatorIds,
          ownerId,
        } = mockOrgItem;

        customers?.map((customer) => {
          const { conversations, conversationId } = customer;

          conversations.map((conversation) => {
            const { messageIds } = conversation;
            appDb.entities.messages.delete(
              messageIds.map((message) => ({ messageId })),
            );
          });
        });
      });
      return {
        statusCode: 200,
        body: JSON.stringify(mockOrgIds),
      };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 200,
        body: err,
      };
    }
  }),
);
