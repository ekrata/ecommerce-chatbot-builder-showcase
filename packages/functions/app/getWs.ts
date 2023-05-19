import { SenderType } from '@/entities/message';
import { WebSocketApi } from 'sst/node/api';
import WebSocket from 'ws';

export const getWs = (
  orgId: string,
  senderId: string,
  senderType: SenderType
) =>
  new WebSocket(
    `${WebSocketApi.appWs.url}/?orgId=${orgId}&${
      senderType === 'customer' ? 'customerId=' : 'operatorId='
    }${senderId}`
  );
