import { EntityItem, Service } from 'electrodb';
import { getAppDb } from '../db';
import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';
import * as Sentry from '@sentry/serverless';

export const expandableField = ['customerId', 'operatorId'] as const;
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
  expansionFields: ExpandableField[]
) => {
  const getBatchFields = async (
    data: {
      [key: string]: any;
    }[]
  ) => {
    let expandedData = data;
    if (expansionFields.includes('customerId')) {
      try {
        const batchCustomers = await db.entities.customers
          .get(
            data.map((item) => ({
              customerId: item?.['customerId'],
              orgId: item?.['orgId'],
            }))
          )
          .go();
        expandedData = await Promise.all(
          [...expandedData].map((item, i) => ({
            ...item,
            customer: batchCustomers.data[i] as EntityItem<typeof Customer>,
          }))
        );
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        throw new Error(`Failed to expand customerId: ${err}`);
      }
    }
    if (expansionFields.includes('operatorId')) {
      try {
        const batchOperators = await db.entities.operators
          .get(
            data.map((item) => ({
              operatorId: item?.['operatorId'],
              orgId: item?.['orgId'],
            }))
          )
          .go();
        expandedData = await Promise.all(
          [...expandedData].map((item, i) => ({
            ...item,
            operator: batchOperators.data[i] as EntityItem<typeof Operator>,
          }))
        );
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        throw new Error(`Failed to expand operatorid: ${err}`);
      }
    }
    console.log(expandedData);
    return expandedData;
  };

  const expandedData = await getBatchFields(data);

  // delete original ids used in expansion to prevent duplication
  expandedData.map((item) => {
    expansionFields.map((expansionField) => {
      delete item[expansionField];
    });
  });
  return expandedData;
};
