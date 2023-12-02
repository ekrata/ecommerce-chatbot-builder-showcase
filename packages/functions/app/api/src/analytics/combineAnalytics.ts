import { differenceInSeconds } from 'date-fns';
import { EntityItem } from 'electrodb';
import _ from 'lodash';

import {
  AnalyticConversations,
  AnalyticCsat,
  AnalyticDuration,
  analyticDuration,
  AnalyticNps,
} from '@/entities/analytics';
import { CreateAnalytic } from '@/entities/entities';
import { Org } from '@/entities/org';

import { getAppDb } from '../db';

export const combineAnalytics = async (
  fromTimestamp: number,
  endTimestamp: number,
  duration: AnalyticDuration,
  appDb: ReturnType<typeof getAppDb>,
) => {
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

    const subDuration =
      analyticDuration[
        analyticDuration.findIndex((value) => value === duration) - 1
      ];
    const analytics = Promise.all(
      orgs?.map(async (org) => {
        // articles

        // aggreate conversations
        const analytics = await appDb.entities.analytics.query
          .byOrg({
            orgId: org.orgId,
            duration: subDuration,
          })
          .where(({ createdAt }, { between }) =>
            between(createdAt, endTimestamp, fromTimestamp),
          )
          .go({ limit: 500 });

        if (!analytics?.data) {
          return;
        }

        // scores/averages get averaged; add atomic scores together and then divide by analytics length
        // otherwise, other metrics/counts are just summed

        const newAnalytic = analytics.data.reduce((prev, curr) => {
          const newCsat = curr.csat?.map((question) => {
            const prevQuestion = prev.csat?.find(
              (item) => question === item?.question,
            );
            if (
              prevQuestion &&
              question.score &&
              question.respondents &&
              question.question
            ) {
              return {
                score: (prevQuestion?.score ?? 0) + question.score,
                respondents:
                  (prevQuestion.respondents ?? 0) + question.respondents,
                question: question.question,
              };
            }
            return question;
          });
          const newNps = curr.nps?.map((question) => {
            const prevQuestion = prev.nps?.find(
              (item) => question === item?.question,
            );
            if (
              prevQuestion &&
              question.score &&
              question.respondents &&
              question.question
            ) {
              return {
                score: (prevQuestion?.score ?? 0) + question.score,
                respondents:
                  (prevQuestion.respondents ?? 0) + question.respondents,
                question: question.question,
              };
            }
            return question;
          });

          const prevAvgWaitTime = prev.conversations?.avgWaitTime;
          const currAvgWaitTime = curr.conversations?.avgWaitTime;
          const newAvgWaitTime = {
            unassignedCount:
              (prevAvgWaitTime?.unassignedCount ?? 0) +
              (currAvgWaitTime?.unassignedCount ?? 0),
            unassignedSecondsTotal:
              (prevAvgWaitTime?.unassignedSecondsTotal ?? 0) +
              (currAvgWaitTime?.unassignedSecondsTotal ?? 0),
            openCount:
              (prevAvgWaitTime?.openCount ?? 0) +
              (currAvgWaitTime?.openCount ?? 0),
            openSecondsTotal:
              (prevAvgWaitTime?.unassignedSecondsTotal ?? 0) +
              (currAvgWaitTime?.unassignedSecondsTotal ?? 0),
          } as typeof currAvgWaitTime;

          const prevStatus = prev.conversations?.status;
          const currStatus = curr.conversations?.status;

          const newStatus = {
            open: (prevStatus?.open ?? 0) + (currStatus?.open ?? 0),
            solved: (prevStatus?.solved ?? 0) + (currStatus?.solved ?? 0),
            unassigned:
              (prevStatus?.unassigned ?? 0) + (currStatus?.unassigned ?? 0),
          } as typeof currStatus;

          const prevTopics = prev.conversations?.topics;
          const currTopics = curr.conversations?.topics;
          const newTopics = {
            orderIssues:
              (prevTopics?.orderIssues ?? 0) + (currTopics?.orderIssues ?? 0),
            orderStatus:
              (prevTopics?.orderStatus ?? 0) + (currTopics?.orderStatus ?? 0),
            products: (prevTopics?.products ?? 0) + (currTopics?.products ?? 0),
            shippingPolicy:
              (prevTopics?.shippingPolicy ?? 0) +
              (currTopics?.shippingPolicy ?? 0),
          } as typeof currTopics;

          const prevChannels = prev.conversations?.channels;
          const currChannels = curr.conversations?.channels;

          const newChannels = {
            website:
              (prevChannels?.website ?? 0) + (currChannels?.website ?? 0),
            whatsapp:
              (prevChannels?.whatsapp ?? 0) + (currChannels?.whatsapp ?? 0),
            instagram:
              (prevChannels?.instagram ?? 0) + (currChannels?.instagram ?? 0),
            messenger:
              (prevChannels?.messenger ?? 0) + (currChannels?.messenger ?? 0),
            emailTicket:
              (prevChannels?.emailTicket ?? 0) +
              (currChannels?.emailTicket ?? 0),
          } as typeof currChannels;

          return {
            duration: subDuration,
            orgId: prev.orgId,
            analyticId: prev.analyticId,
            csat: newCsat,
            nps: newNps,
            conversations: {
              avgWaitTime: newAvgWaitTime,
              topics: newTopics,
              channels: newChannels,
              status: newStatus,
            },
            startAt: curr.startAt,
            endAt: curr.endAt,
          };
        });

        // avg new scores

        const avgWaitTime = newAnalytic.conversations?.avgWaitTime;

        const createBody: CreateAnalytic = {
          ...newAnalytic,
          csat: newAnalytic.csat?.map((item) => ({
            ...item,
            score:
              item.score != null && item?.respondents != null
                ? item?.score / item?.respondents
                : undefined,
          })),
          nps: newAnalytic.nps?.map((item) => ({
            ...item,
            score:
              item.score != null && item?.respondents != null
                ? item?.score / item?.respondents
                : undefined,
          })),
          conversations: {
            ...newAnalytic.conversations,
            avgWaitTime: {
              ...newAnalytic.conversations?.avgWaitTime,
              unassignedSecondsAvg:
                avgWaitTime?.unassignedCount &&
                avgWaitTime.unassignedSecondsTotal
                  ? avgWaitTime.unassignedSecondsTotal /
                    avgWaitTime.unassignedCount
                  : undefined,
              openSecondsAvg:
                avgWaitTime?.openCount && avgWaitTime.openSecondsTotal
                  ? avgWaitTime.openSecondsTotal / avgWaitTime.openCount
                  : undefined,
            },
          },
          orgId: org.orgId,
          duration,
          startAt: fromTimestamp,
          endAt: endTimestamp,
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
  } catch (err) {
    console.log(err);
  }
};
