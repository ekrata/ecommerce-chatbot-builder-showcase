import { SenderType } from '@/entities/message';
import { getWs } from 'packages/functions/app/getWs';
import { WebSocketApi } from 'sst/node/api';
import WebSocket from 'ws';

export const getCustomerWs = (orgId: string, customerId: string) =>
  getWs(orgId, customerId, 'customer').on('customers/conversations/sendNewMessage', () = {

  })
