import { differenceInSeconds, sub } from 'date-fns';
import { EntityItem } from 'electrodb';
import _ from 'lodash';
import { analyticsId } from 'next.config';
import { ApiHandler, useJsonBody, usePathParams } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import { Analytic, AnalyticConversations } from '@/entities/analytics';
import { CreateAnalytic, CreateArticle } from '@/entities/entities';
import { Org } from '@/entities/org';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

export type RatingCount = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

const appDb = getAppDb(Config.REGION, Table.app.tableName);

// instead of updating the latest analytic everytime a new conversation happens, we retroactively calculate the metrics here
export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    // const body: CreateAnalytic = useJsonBody();
    const dateNow = Date.now();
    const startAt = sub(dateNow, { hours: 1 });
    try {
      let orgs: EntityItem<typeof Org>[] = [];
      let cursor: string | null = '';
      do {
        const orgsRes: {
          cursor: string | null;
          data: EntityItem<typeof Org>[];
        } = await appDb.entities.orgs.scan.go({
          cursor: cursor,
        });
        cursor = orgsRes.cursor;
        orgs = [...orgs, ...orgsRes?.data];
      } while (cursor != null);

      orgs?.map(async (org) => {
        // articles

        // aggreate conversations
        const conversations = await appDb.entities.conversations.query
          .byOrg({
            orgId: org.orgId,
          })
          .where((conversation, { between }) =>
            between(
              new Date(conversation.createdAt),
              startAt,
              new Date(dateNow),
            ),
          )
          .go({ limit: 500 });

        const conversationAnalytic = conversations?.data.reduce(
          (prev, curr) => {
            const topics = {
              orderIssues: prev?.topics?.orderIssues ?? 0,
              orderStatus: prev?.topics?.orderStatus ?? 0,
              products: prev?.topics?.products ?? 0,
              shippingPolicy: prev?.topics?.shippingPolicy ?? 0,
            };

            if (
              (topics?.orderIssues,
              topics?.orderStatus,
              topics?.products,
              topics?.shippingPolicy)
            ) {
              switch (curr?.topic) {
                case 'orderIssues': {
                  topics.orderIssues += 1;
                }
                case 'orderStatus': {
                  topics.orderStatus += 1;
                }
                case 'products': {
                  topics.orderIssues += 1;
                }
                case 'shippingPolicy': {
                  topics.shippingPolicy += 1;
                }
              }
            }

            const channels = {
              emailTicket: prev?.channels?.emailTicket ?? 0,
              website: prev?.channels?.website ?? 0,
              instagram: prev?.channels?.instagram ?? 0,
              messenger: prev?.channels?.messenger ?? 0,
              whatsapp: prev?.channels?.whatsapp ?? 0,
            };

            if (
              prev?.channels?.emailTicket &&
              prev?.channels?.website &&
              prev?.channels?.instagram &&
              prev?.channels?.messenger &&
              prev?.channels?.whatsapp
            ) {
              switch (curr?.channel) {
                case 'emailTicket': {
                  channels.emailTicket += 1;
                }
                case 'website': {
                  channels.website += 1;
                }
                case 'instagram': {
                  channels.instagram += 1;
                }
                case 'messenger': {
                  channels.messenger += 1;
                }
                case 'whatsapp': {
                  channels.whatsapp += 1;
                }
              }
            }

            const status = {
              open: prev?.status?.open ?? 0,
              unassigned: prev?.status?.unassigned ?? 0,
              solved: prev?.status?.solved ?? 0,
            };

            if (
              prev?.status?.open &&
              prev?.status?.unassigned &&
              prev?.status?.solved
            ) {
              switch (curr?.status) {
                case 'open': {
                  status.open += 1;
                }
                case 'unassigned': {
                  status.unassigned += 1;
                }
                case 'solved': {
                  status.solved += 1;
                }
              }
            }

            if (
              curr?.createdAt &&
              curr?.timeAtOpen &&
              prev.avgWaitTime?.unassignedSecondsTotal &&
              prev.avgWaitTime?.openSecondsTotal &&
              curr?.timeAtResolved &&
              prev.avgWaitTime.unassignedCount &&
              prev.avgWaitTime.openCount
            ) {
              prev.avgWaitTime.unassignedSecondsTotal += differenceInSeconds(
                curr?.createdAt,
                curr?.timeAtOpen,
              );
              prev.avgWaitTime.openSecondsTotal += differenceInSeconds(
                curr?.timeAtOpen,
                curr?.timeAtResolved,
              );
              prev.avgWaitTime.unassignedCount += 1;
              prev.avgWaitTime.openCount += 1;
            }

            let newNpsTotal = prev?.npsTotal;
            let newNpsCount = prev?.npsCount;
            if (curr.feedback?.nps?.ratings) {
              newNpsTotal = _.assignWith(
                {},
                prev?.npsTotal,
                curr.feedback?.nps?.ratings as RatingCount,
                _.add,
              );
              newNpsCount += 1;
            }

            let newCsatTotal = prev?.csatTotal as RatingCount;
            let newCsatCount = prev?.csatCount;
            if (curr?.feedback?.csat?.questionsRating) {
              newCsatTotal = curr?.feedback?.csat?.questionsRating
                .map((obj) => obj.ratings)
                .reduce(
                  (prev, curr) => {
                    const nextTotal = _.assignWith(
                      {},
                      prev,
                      curr as RatingCount,
                      _.add,
                    );
                    newCsatCount += 1;
                    return nextTotal as RatingCount;
                  },
                  { ...(prev.csatTotal as RatingCount) },
                ) as RatingCount;
            }

            return {
              ...prev,
              topics: {
                ...topics,
              },
              channels: {
                ...channels,
              },
              status: {
                ...status,
              },
              // average these values after reduce finishes
              avgWaitTime: {
                ...prev?.avgWaitTime,
              },
              csatTotal: newCsatTotal,
              csatCount: newCsatCount,
              npsTotal: newNpsTotal,
              npsCount: newNpsCount,
            } as AnalyticConversations & {
              npsTotal: RatingCount;
              npsCount: number;
              csatTotal: RatingCount;
              csatCount: number;
            };
          },
          {
            npsTotal: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
            csatTotal: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
            csatCount: 0,
            npsCount: 0,
          } as AnalyticConversations & {
            npsTotal: RatingCount;
            npsCount: number;
            csatTotal: RatingCount;
            csatCount: number;
          },
        );

        // // aggregate visitors
        // const visits = await appDb.entities.visits.query
        //   .byOrg({
        //     orgId: org.orgId,
        //   })
        //   .where((visit, { between }) =>
        //     between(new Date(visit.createdAt), startAt, new Date(dateNow)),
        //   )
        //   .go({ limit: 500 });

        // const urls = visits?.data?.map((visit) => visit.url);
        // const visitedUrlsFreq = _.maxBy(
        //   _.map(_.groupBy(urls), (url) => ({
        //     url: url[0],
        //     number: url.length,
        //     avg: url.length / urls.length,
        //   })),
        //   'number',
        // );

        // if every user gave the highest score for every csat question
        const csatMax = (conversationAnalytic?.csatCount ?? 0) * 5;

        // add up all the ratings
        const actualCsatScoreTotal =
          conversationAnalytic.csatTotal[1] +
          conversationAnalytic.csatTotal[2] +
          conversationAnalytic.csatTotal[3] +
          conversationAnalytic.csatTotal[4] +
          conversationAnalytic.csatTotal[5];

        const promoters = conversationAnalytic.npsTotal[5];
        const passive = conversationAnalytic.npsTotal[4];
        const detractors =
          conversationAnalytic.npsTotal[1] +
          conversationAnalytic.npsTotal[2] +
          conversationAnalytic.npsTotal[3];

        const totalNps = promoters + passive + detractors;
        const promoterPercentage = promoters / totalNps;
        const detractorPercentage = detractors / totalNps;

        // if every user gave the highest score for every csat question
        const res = await appDb.entities.analytics
          .create({
            orgId: org.orgId,
            analyticId: uuidv4(),
            startAt: startAt.getTime(),
            endAt: dateNow,
            conversations: {
              ...conversationAnalytic,
              avgWaitTime: {
                ...conversationAnalytic.avgWaitTime,
                unassignedSecondsAvg:
                  (conversationAnalytic.avgWaitTime?.unassignedSecondsTotal ??
                    0) /
                  (conversationAnalytic?.avgWaitTime?.unassignedCount ?? 0),
                openSecondsAvg:
                  (conversationAnalytic.avgWaitTime?.openSecondsTotal ?? 0) /
                  (conversationAnalytic?.avgWaitTime?.openCount ?? 0),
              },
            },
            csat: actualCsatScoreTotal / csatMax,
            nps: promoterPercentage - detractorPercentage,
          })
          .go();
      });
      return {
        statusCode: 200,
        body: '',
      };
    } catch (err) {
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
