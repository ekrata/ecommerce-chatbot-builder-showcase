import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getWsUrl } from '@/app/getWsUrl';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { StartChatButton } from './StartChatButton';
import { NavBar } from './NavBar';
import { HomeScreen } from './(screens)/HomeScreen';
import { HelpScreen } from './(screens)/HelpScreen';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import { EntityItem } from 'electrodb';
import { Conversation } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { MessagesScreen } from './(screens)/(messages)/MessagesScreen';

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { chatWidget: {org, configuration, customer, widgetState, eventNewMessage, eventNewConversation, eventUpdateConversation} } =
    useChatWidgetStore();

  const socket: WebSocket | undefined = useMemo(
    () =>
      org?.orgId && customer?.customerId
        ? new WebSocket(
            mockWsUrl ?? getWsUrl(org?.orgId, customer?.customerId, 'customer')
          )
        : undefined,
    [org, customer]
  );

  socket?.addEventListener('eventNewMessage', (event) => {
    const { message } = JSON.parse(event?.data) as { message: EntityItem<typeof Message> }
    eventNewMessage(message)
  });

  socket?.addEventListener('eventUpdatedConversation', (event) => {
    const { conversation } = JSON.parse(event?.data) as { conversation: EntityItem<typeof Conversation> }
    eventUpdateConversation(conversation)
  });

  socket?.addEventListener('eventNewConversation', (event) => {
    const { conversation } = JSON.parse(event?.data) as { conversation: EntityItem<typeof Conversation> }
    eventNewConversation(conversation)
  });

  let content: ReactNode;

  switch (widgetState) {
    case 'home': {
      content = (
        <>
          <HomeScreen />
          <NavBar />
        </>
      );
    }
    case 'chat': {
        <>
          <MessagesScreen />
        </>
    }
    case 'messages': {
      content = (
        <>
          <MessagesScreen />
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
