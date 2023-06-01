import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { getWs } from 'packages/functions/app/getWs';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';
import { StartChatButton } from './StartChatButton';

export const ChatWidget: FC = ({ children }: PropsWithChildren) => {
  const { org, visitor, configuration, customer, messages } =
    useCustomerChatStore(
      (state) => ({
        org: state.org,
        visitor: state.visitor,
        customer: state.customer,
        configuration: state.configuration,
        chatWindow: 'minimized',
      }),
      shallow
    );

  const socket = useMemo(
    () =>
      org?.orgId && customer?.customerId
        ? getWs(org?.orgId, customer?.customerId, 'customer')
            .on('sendNewMessageToCustomer', (event) => {
              useCustomerChatStore.setState({
                ...useCustomerChatStore.getState(),
                messages: [...(messages ?? []), event.msg],
              });
            })
            .on('sendNewConversationToCustomer', (event) => {
              useCustomerChatStore.setState({
                ...useCustomerChatStore.getState(),
                conversation: event.conversation,
                widgetState: 'chat',
              });
            })
            .on('sendUpdateConversationToCustomer', (event) => {
              const { conversation } = event;
              useCustomerChatStore.setState({
                ...useCustomerChatStore.getState(),
                conversation: event.conversation,
                widgetState: 'chat',
              });
            })
        : undefined,
    [org, customer]
  );

  return (
    <>
      <AppSocketProvider appSocket={socket}>{children}</AppSocketProvider>
    </>
  );
};
