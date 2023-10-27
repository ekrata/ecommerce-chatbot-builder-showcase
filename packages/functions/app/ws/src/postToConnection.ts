import { ApiGatewayManagementApi, AWSError } from 'aws-sdk';
import { EntityItem } from 'electrodb';

import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';

import { WsAppDetailType } from '../../../../../types/snsTypes';
import { AppDb } from '../../api/src/db';

export type WsAppEvent = {
  type: WsAppDetailType;
  body: object;
};

// get the sender and recipient. Let sender know the recipent has received it
export const postToConnection = async (
  appDb: AppDb,
  apiG: ApiGatewayManagementApi,
  recipients: (EntityItem<typeof Operator> | EntityItem<typeof Customer>)[],
  event: WsAppEvent,
) => {
  // post created message to filtered operators and customer
  recipients.map(async (recipient) => {
    try {
      if (recipient?.connectionId) {
        await apiG
          .postToConnection({
            ConnectionId: recipient?.connectionId,
            Data: JSON.stringify(event),
          })
          .promise();
      }
    } catch (e) {
      console.log('error', e);
      const { orgId } = recipient;
      if ((e as AWSError).statusCode === 410) {
        const customer = recipient as EntityItem<typeof Customer>;
        const operator = recipient as EntityItem<typeof Operator>;
        if (customer?.customerId) {
          console.log('disconnecting customer', customer.customerId);
          await appDb.entities.customers
            .patch({ orgId, customerId: customer.customerId })
            .set({ connectionId: '' })
            .go();
          return {
            statusCode: 410,
            body: 'Connection expired. ',
          };
        }

        if (operator?.operatorId) {
          console.log('disconnecting operator', operator.operatorId);
          const res = await appDb.entities.operators
            .patch({ orgId, operatorId: operator?.operatorId })
            .set({ connectionId: '' })
            .go();
          return {
            statusCode: 410,
            body: 'Connection expired. ',
          };
        }
      }
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      };
    }
  });
};
