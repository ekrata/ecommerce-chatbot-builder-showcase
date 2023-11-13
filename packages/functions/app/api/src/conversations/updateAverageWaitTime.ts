import { sub } from 'date-fns';
import { EntityItem } from 'electrodb';
import {
  ApiHandler,
  usePathParams,
  useQueryParam,
  useQueryParams,
} from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import {
  Conversation,
  ConversationChannel,
  ConversationStatus,
  ConversationTopic,
} from '@/entities/conversation';
import { Org } from '@/entities/org';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

type WaitTimes = {
  orgId: string;
  unassignedWaitTimeTotal: number;
  unassignedWaitTimeCount: number;
  openWaitTimeTotal: number;
  openWaitTimeCount: number;
};

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    try {
      const dateNow = Date.now();
      const yesterday = sub(dateNow, { days: 1 }).getTime();

      let orgs: EntityItem<typeof Org>[] = [];
      let cursor = null;

      do {
        const orgResponses: {
          data: EntityItem<typeof Org>[];
          cursor: string | null;
        } = await appDb?.entities?.orgs.query.all({}).go({ cursor });
        orgs = [...orgs, ...orgResponses?.data];
        cursor = orgResponses?.cursor;
      } while (cursor !== null);

      const orgWaitTimes = await Promise.all(
        orgs?.map(async (org) => {
          if (org?.orgId) {
            const conversations = await appDb.entities.conversations.query
              .byOrg({ orgId: org?.orgId ?? '' })
              .where(
                ({ timeAtOpen, timeAtResolved }, { between }) =>
                  `${between(timeAtOpen, dateNow, yesterday)} OR ${between(
                    timeAtResolved,
                    dateNow,
                    yesterday,
                  )}`,
              )
              // not true  as we limit to 250 to save compute. This may change.
              .go({ limit: 250 });
            const waitTimes = conversations?.data?.reduce<WaitTimes>(
              (prev: WaitTimes, curr: EntityItem<typeof Conversation>) => {
                let nextIteration = prev;
                if (curr?.timeAtOpen && curr?.createdAt) {
                  nextIteration = {
                    ...nextIteration,
                    unassignedWaitTimeTotal:
                      nextIteration?.unassignedWaitTimeTotal +
                      (curr.timeAtOpen - curr.createdAt),
                    unassignedWaitTimeCount:
                      nextIteration?.unassignedWaitTimeCount + 1,
                  };
                }
                if (curr?.timeAtOpen && curr?.timeAtResolved) {
                  nextIteration = {
                    ...nextIteration,
                    openWaitTimeTotal:
                      nextIteration?.openWaitTimeTotal +
                      (curr.timeAtResolved - curr.timeAtOpen),
                    unassignedWaitTimeCount:
                      nextIteration?.unassignedWaitTimeCount + 1,
                  };
                }
                return nextIteration;
              },
              {
                orgId: org?.orgId,
                unassignedWaitTimeTotal: 0,
                openWaitTimeCount: 0,
                openWaitTimeTotal: 0,
                unassignedWaitTimeCount: 0,
              } as WaitTimes,
            );
            return waitTimes;
          }
        }),
      );
      await Promise.all(
        orgWaitTimes?.map(async (orgWaitTime) => {
          if (orgWaitTime) {
            const {
              orgId,
              unassignedWaitTimeTotal,
              unassignedWaitTimeCount,
              openWaitTimeCount,
              openWaitTimeTotal,
            } = orgWaitTime;

            return appDb.entities.orgs
              .update({ orgId: orgId })
              .append({
                averageUnassignedWaitTime: [
                  {
                    startDayTime: yesterday,
                    averageWaitTime:
                      unassignedWaitTimeTotal > 0 && unassignedWaitTimeCount > 0
                        ? unassignedWaitTimeTotal / unassignedWaitTimeCount
                        : undefined,
                  },
                ],
                averageOpenWaitTime: [
                  {
                    startDayTime: yesterday,
                    averageWaitTime:
                      openWaitTimeTotal > 0 && openWaitTimeCount > 0
                        ? openWaitTimeTotal / openWaitTimeCount
                        : undefined,
                  },
                ],
              })
              .go();
          }
        }),
      );
      return {
        statusCode: 200,
        body: `Successfully updated wait times for the day starting: ${new Date(
          yesterday,
        ).toLocaleDateString()}`,
      };
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 200,
        body: JSON.stringify(err),
      };
    }
  }),
);
