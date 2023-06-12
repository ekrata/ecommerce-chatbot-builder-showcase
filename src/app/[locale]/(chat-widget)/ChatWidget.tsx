import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { shallow } from 'zustand/shallow';
import { getWsUrl } from '@/app/getWsUrl';
import { GiConsoleController } from 'react-icons/gi';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';
import { StartChatButton } from './StartChatButton';
import { ChatForm } from './(screens)/(messages)/ChatScreen';
import { NavBar } from './NavBar';
import { HomeScreen } from './(screens)/HomeScreen';
import { MessageListScreen } from './(screens)/(messages)/MessageListScreen';
import { HelpScreen } from './(screens)/HelpScreen';
import { AppSocketProvider } from '@/components/AppSocketProvider';

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { org, configuration, customer, messages, widgetState } =
    useCustomerChatStore();

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

  let content: ReactNode;

  switch (widgetState) {
    case 'chat': {
      content = <ChatForm></ChatForm>;
    }
    case 'home': {
      content = (
        <>
          <HomeScreen />
          <NavBar />
        </>
      );
    }
    case 'messages': {
      content = (
        <>
          <MessageListScreen />
          <NavBar />
        </>
      );
    }
    case 'help': {
      content = (
        <>
          <HelpScreen />
          <NavBar />
        </>
      );
    }
    case 'minimized': {
      content = (
        <StartChatButton
          enableButtonLabel={false}
          widgetPosition={'left'}
          startChatLabel={''}
          backgroundColor={''}
        ></StartChatButton>
      );
    }
  }

  return (
    <>
      <AppSocketProvider appSocket={socket}>{content}</AppSocketProvider>
    </>
  );
};
