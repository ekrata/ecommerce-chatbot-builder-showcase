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
  const { chatWidget: {org, configuration, widgetVisibility, customer, widgetState, eventNewMessage, eventNewConversation, eventUpdateConversation} } =
    useChatWidgetStore();

  const {widgetPosition} = {...configuration?.channels?.liveChat?.appearance?.widgetAppearance}

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


  const content = useMemo(() => {
        switch (widgetState) {
          case 'home': {
            return (
              <>
                <HomeScreen />
                <NavBar />
              </>
            );
          }
          case 'chat': {
            return (
              <>
                <MessagesScreen />
              </>
            )
          }
          case 'messages': {
            return (
              <>
                <MessagesScreen />
                <NavBar />
              </>
            );
          }
          case 'help': {
            return (
              <>
                <HelpScreen />
                <NavBar />
              </>
            );
          }
        }
      }, [widgetState])

  return (
    <div className={`${widgetPosition === 'left' ? 'md:absolute md:left-20 md:bottom-20' : 'md:absolute md:right-20 md:bottom-20'}`}>
      <AppSocketProvider appSocket={socket}>
        {widgetVisibility === 'open' &&
        (
          <div className="flex flex-col font-sans h-full w-full md:w-[27rem] md:h-[40rem] rounded-xl max-w-xl dark:bg-gray-800 animate-fade-up">
            {content}
          </div>
          )}
          <div className='mt-10' >
            <StartChatButton></StartChatButton>
          </div>
      </AppSocketProvider>
    </div>
  );
};
