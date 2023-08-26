import { SenderType } from '@/entities/message';

export const getWsUrl = (
  orgId: string,
  senderId: string,
  senderType: SenderType,
) =>
  `${process.env.NEXT_PUBLIC_APP_WS_URL}/?orgId=${orgId}&${
    senderType === 'customer' ? 'customerId=' : 'operatorId='
  }${senderId}`;
