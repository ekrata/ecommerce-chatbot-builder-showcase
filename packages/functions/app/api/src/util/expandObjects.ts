import { EntityItem, Service } from 'electrodb';

import { Bot } from '@/entities/bot';
import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../db';

export const expandableField = ['customerId', 'operatorId', 'botId'] as const;
export type ExpandableField = (typeof expandableField)[number];
// /**

//  * Using a . to seperate nested keys of a object, return the object that the nested key structure is responsible for indexing.
//  * @date 16/06/2023 - 16:02:37
//  *
//  * @param {object} data an object
//  * @param {string} fieldKey a string like customer.orders etc
//  * @returns {object}
//  */
// export const getFieldKeyValue = (data: object, fieldKey: string): ExpandableField => {
//   const splitKey = fieldKey.split('.');
//   return splitKey.reduce((prev, curr) => {
//     return prev[curr as keyof typeof data]
//   }, data) as ExpandableField
// }

/**
 * Expand objects by foreign key. This can only occur for 1:1 relationships.
 * Must be called within a lambda function.
 * @date 16/06/2023 - 16:02:37
 *
 * @param {ReturnType<typeof getAppDb>} db
 * @param {object} data
 * @param {string[]} expansionFields
 */
export const expandObjects = async (
  db: ReturnType<typeof getAppDb>,
  data: {
    [key: string]: any;
  }[],
  expansionFields: ExpandableField[],
) => {
  const getBatchFields = async (
    data: {
      [key: string]: any;
    }[],
  ) => {
    let expandedData = data;
    if (expansionFields.includes('customerId')) {
      try {
        const uniqueCustomerData = Object.values(
          data.reduce((acc, item) => {
            const { orgId, customerId } = item;
            return { ...acc, [`${orgId}-${customerId}`]: item };
          }, {}),
        );
        const batchIds = uniqueCustomerData.map((item) => ({
          orgId: item?.['orgId'],
          customerId: item?.['customerId'],
        }));
        const batchCustomers = await db.entities.customers
          .get(batchIds)
          .go({ preserveBatchOrder: true });

        // compare keys to find the respective response.
        expandedData = await Promise.all(
          [...expandedData].map((item, i) => ({
            ...item,
            customer: batchCustomers?.data.find(
              (customer) =>
                `${item.orgId}-${item.customerId}` ===
                `${customer?.orgId}-${customer?.customerId}`,
            ) as EntityItem<typeof Customer>,
          })),
        );
      } catch (err) {
        Sentry.captureException(err);
        throw new Error(`Failed to expand customerId: ${err}`);
      }
    }
    if (expansionFields.includes('operatorId')) {
      try {
        const uniqueOperatorData = Object.values(
          data.reduce((acc, item) => {
            const { orgId, operatorId } = item;
            return { ...acc, [`${orgId}-${operatorId}`]: item };
          }, {}),
        );
        const batchOperators = await db.entities.operators
          .get(
            uniqueOperatorData.map((item) => ({
              operatorId: item?.['operatorId'],
              orgId: item?.['orgId'],
            })),
          )
          .go({ preserveBatchOrder: true });
        expandedData = await Promise.all(
          [...expandedData].map((item, i) => ({
            ...item,
            operator: batchOperators.data.find(
              (operator) =>
                `${item.orgId}-${item.operatorId}` ===
                `${operator?.orgId}-${operator?.operatorId}`,
            ) as EntityItem<typeof Operator>,
          })),
        );
      } catch (err) {
        Sentry.captureException(err);
        throw new Error(`Failed to expand operatorid: ${err}`);
      }
    }
    // if (expansionFields.includes('botId')) {
    //   try {
    //     const uniqueBotData = Object.values(
    //       data.reduce((acc, item) => {
    //         const { orgId, botId } = item;
    //         return { ...acc, [`${orgId}-${botId}`]: item };
    //       }, {}),
    //     );
    //     const batchBots = await db.entities.bots
    //       .get(
    //         uniqueBotData.map((item) => ({
    //           botId: item?.['botId'],
    //           orgId: item?.['orgId'],
    //         })),
    //       )
    //       .go({ preserveBatchOrder: true });
    //     expandedData = await Promise.all(
    //       [...expandedData].map((item, i) => ({
    //         ...item,
    //         bot: batchBots.data.find(
    //           (bot) =>
    //             `${item.orgId}-${item.botId}` === `${bot?.orgId}-${bot?.botId}`,
    //         ) as EntityItem<typeof Bot>,
    //       })),
    //     );
    //   } catch (err) {
    //     Sentry.captureException(err);
    //     throw new Error(`Failed to expand operatorid: ${err}`);
    //   }
    // }
    return expandedData;
  };

  const expandedData = await getBatchFields(data);

  return expandedData;
};
