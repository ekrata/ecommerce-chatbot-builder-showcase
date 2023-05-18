import { SenderType } from '@/entities/message';
import { WebSocketApi } from 'sst/node/api';
import WebSocket from 'ws';

export const ws = (orgId: string, senderId: string, senderType: SenderType) =>
  new WebSocket(
    `${WebSocketApi.appWs.url}/$connect?orgId=${orgId}&${
      senderType === 'customer' ? 'customerId=' : 'operatorId'
    }${senderId}`
  );
