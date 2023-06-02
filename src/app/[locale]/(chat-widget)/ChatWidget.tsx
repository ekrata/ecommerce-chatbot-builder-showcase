import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { getWsUrl } from '@/app/getWsUrl';
import { GiConsoleController } from 'react-icons/gi';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';
import { StartChatButton } from './StartChatButton';

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { org, configuration, customer, messages } = useCustomerChatStore();

  const socket: WebSocket | undefined = useMemo(
    () =>
      org?.orgId && customer?.customerId
        ? new WebSocket(
            mockWsUrl ?? getWsUrl(org?.orgId, customer?.customerId, 'customer')
          )
        : undefined,
    [org, customer]
  );

  socket?.addEventListener('sendNewMessageToCustomer', (event) => {
    const { message } = JSON.parse(event?.data);
    useCustomerChatStore.setState({
      ...useCustomerChatStore.getState(),
      messages: [...(messages ?? []), message],
    });
  });

  socket?.addEventListener('sendNewConversationToCustomer', (event) => {
    const { conversation } = JSON.parse(event?.data);
    useCustomerChatStore.setState({
      ...useCustomerChatStore.getState(),
      conversation,
      widgetState: 'chat',
    });
  });

  socket?.addEventListener('sendNewConversationToCustomer', (event) => {
    const { conversation } = useCustomerChatStore.getState();
    useCustomerChatStore.setState({
      ...useCustomerChatStore.getState(),
      conversation: { ...conversation, ...event?.data?.conversation },
      widgetState: 'chat',
    });
  });

  return (
    <>
      <AppSocketProvider appSocket={socket}>{children}</AppSocketProvider>
    </>
  );
};
