import { add, differenceInSeconds, sub } from 'date-fns';
import { EntityItem } from 'electrodb';
import _ from 'lodash';
import { analyticsId } from 'next.config';
import {
  ApiHandler,
  useJsonBody,
  usePathParams,
  useQueryParam,
} from 'sst/node/api';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';
import { v4 as uuidv4 } from 'uuid';

import {
  Analytic,
  AnalyticConversations,
  AnalyticCsat,
  AnalyticNps,
} from '@/entities/analytics';
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
    const fromTimestamp = useQueryParam('fromTimestamp') ?? undefined;

    const dateNow = fromTimestamp ? parseInt(fromTimestamp, 10) : Date.now();
    const endAt = add(dateNow, { hours: 1 });
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

      // console.log(orgs);

      const analytics = Promise.all(
        orgs?.map(async (org) => {
          // articles

          // aggreate conversations
          const conversations = await appDb.entities.conversations.query
            .byOrg({
              orgId: org.orgId,
            })
            .where(({ createdAt }, { between }) =>
              between(createdAt, dateNow, endAt.getTime()),
            )
            .go({ limit: 500 });

          if (!conversations?.data) {
            return;
          }

          let csatRatingsSum: {
            [question: string]: { rating: RatingCount; respondents: number };
          } = {};
          let npsRatingSum: {
            [question: string]: { rating: RatingCount; respondents: number };
          } = {};

          let analyticData: Required<
            AnalyticConversations & { csat: AnalyticCsat } & {
              nps: AnalyticNps;
            }
          > = {
            topics: {
              orderIssues: 0,
              orderStatus: 0,
              products: 0,
              shippingPolicy: 0,
            },
            channels: {
              instagram: 0,
              messenger: 0,
              website: 0,
              emailTicket: 0,
              whatsapp: 0,
            },
            status: {
              solved: 0,
              unassigned: 0,
              open: 0,
            },
            avgWaitTime: {
              openCount: 0,
              openSecondsAvg: 0,
              openSecondsTotal: 0,
              unassignedSecondsTotal: 0,
              unassignedCount: 0,
              unassignedSecondsAvg: 0,
            },
            csat: [],
            nps: [],
          };

          conversations?.data.forEach((curr) => {
            // console.log('curr', curr);
            switch (curr?.topic) {
              case 'orderIssues': {
                analyticData.topics.orderIssues += 1;
              }
              case 'orderStatus': {
                analyticData.topics.orderStatus += 1;
              }
              case 'products': {
                analyticData.topics.products += 1;
              }
              case 'shippingPolicy': {
                analyticData.topics.shippingPolicy += 1;
              }
            }
            switch (curr?.channel) {
              case 'emailTicket': {
                analyticData.channels.emailTicket += 1;
              }
              case 'website': {
                analyticData.channels.website += 1;
              }
              case 'instagram': {
                analyticData.channels.instagram += 1;
              }
              case 'messenger': {
                analyticData.channels.messenger += 1;
              }
              case 'whatsapp': {
                analyticData.channels.whatsapp += 1;
              }
            }

            switch (curr?.status) {
              case 'open': {
                analyticData.status.open += 1;
              }
              case 'unassigned': {
                analyticData.status.unassigned += 1;
              }
              case 'solved': {
                analyticData.status.solved += 1;
              }
            }

            if (curr?.createdAt && curr?.timeAtOpen) {
              analyticData.avgWaitTime.unassignedSecondsTotal +=
                differenceInSeconds(curr?.timeAtOpen, curr?.createdAt);
              analyticData.avgWaitTime.unassignedCount += 1;
            }

            if (curr?.timeAtOpen && curr?.timeAtResolved) {
              analyticData.avgWaitTime.openSecondsTotal += differenceInSeconds(
                curr?.timeAtResolved,
                curr?.timeAtOpen,
              );
              analyticData.avgWaitTime.openCount += 1;
            }

            if (curr?.feedback?.csat?.questionsRating != null) {
              curr?.feedback?.csat.questionsRating.forEach((feedback) => {
                if (feedback?.question && feedback.ratings) {
                  csatRatingsSum[feedback.question] = {
                    respondents:
                      csatRatingsSum[feedback.question]?.respondents != null
                        ? csatRatingsSum[feedback.question]?.respondents + 1
                        : 1,
                    rating:
                      csatRatingsSum[feedback.question]?.rating != null
                        ? _.assignWith(
                            {},
                            csatRatingsSum[feedback.question].rating,
                            feedback.ratings,
                            _.add,
                          )
                        : feedback.ratings,
                  };
                }
              });
            }

            if (curr?.feedback?.nps?.questionsRating != null) {
              curr?.feedback?.nps?.questionsRating.forEach((feedback) => {
                if (feedback?.question && feedback.ratings) {
                  // initalize
                  npsRatingSum[feedback.question] = {
                    respondents:
                      npsRatingSum[feedback.question]?.respondents != null
                        ? npsRatingSum[feedback.question].respondents + 1
                        : 1,
                    rating:
                      npsRatingSum[feedback.question]?.rating != null
                        ? _.assignWith(
                            {},
                            npsRatingSum[feedback.question].rating,
                            feedback.ratings,
                            _.add,
                          )
                        : feedback.ratings,
                  };
                }
              });
            }
          });

          const csat = Object.entries(csatRatingsSum).map(([key, value]) => {
            return {
              question: key,
              score: (value.rating[4] + value.rating[5]) / value.respondents,
              respondents: value.respondents,
            };
          });

          const nps = Object.entries(npsRatingSum).map(([key, value]) => {
            const promoters = value?.rating[5];
            const detractors =
              value?.rating[1] + value?.rating[2] + value?.rating[3];
            const promoterPercentage =
              (promoters - detractors) / value.respondents;
            return {
              question: key,
              score: promoterPercentage,
              respondents: value.respondents,
            };
          });

          // console.log(csatRatingsSum);
          console.log(csat);

          // console.log(npsRatingSum);
          // console.log(nps);

          const createBody: CreateAnalytic = {
            orgId: org.orgId,
            analyticId: endAt.getTime().toString(),
            startAt: endAt.getTime(),
            endAt: dateNow,
            conversations: {
              ...analyticData,
              avgWaitTime: {
                ...analyticData.avgWaitTime,
                unassignedSecondsAvg:
                  (analyticData.avgWaitTime?.unassignedSecondsTotal ?? 0) /
                    (analyticData?.avgWaitTime?.unassignedCount ?? 0) ||
                  undefined,
                openSecondsAvg:
                  (analyticData.avgWaitTime?.openSecondsTotal ?? 0) /
                    (analyticData?.avgWaitTime?.openCount ?? 0) || undefined,
              },
            },
            csat,
            nps,
          };

          console.log(createBody);
          // if every user gave the highest score for every csat question
          const res = await appDb.entities.analytics.upsert(createBody).go();
          return res;
        }),
      );
      return {
        statusCode: 200,
        body: JSON.stringify(analytics),
      };
    } catch (err) {}
  }),
);
