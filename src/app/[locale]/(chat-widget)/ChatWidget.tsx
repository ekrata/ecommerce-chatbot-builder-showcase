import {
  createContext, Dispatch, FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useCreateCustomerMut } from '../(hooks)/mutations/useCreateCustomerMut';
import { useConfigurationQuery } from '../(hooks)/queries';
import { useCustomerQuery } from '../(hooks)/queries/useCustomerQuery';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { ChatScreen } from './(screens)/(messages)/ChatScreen';
import { ConversationsScreen } from './(screens)/(messages)/ConversationsScreen';
import { ArticleScreen } from './(screens)/ArticleScreen';
import { HelpScreen } from './(screens)/HelpScreen';
import { HomeScreen } from './(screens)/HomeScreen';
import { NavBar } from './NavBar';
import { StartChatButton } from './StartChatButton';

export interface ConversationsState {
  selectedConversationId?: string
}

export const ConversationsContext = createContext<[ConversationsState?, Dispatch<ConversationsState>?]>([]);

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { chatWidget: { widgetVisibility, selectedConversationId, selectedArticleId, widgetState } } =
    useChatWidgetStore();
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const customerQuery = useCustomerQuery(orgId);
  const createCustomerMut = useCreateCustomerMut(orgId, uuidv4())

  // create customer and assign to conversation if no customer currently found.
  useEffect(() => {
    (async () => {
      if (!customerQuery?.data?.customerId && customerQuery.fetchStatus === 'idle' && customerQuery.status === 'error') {
        const res = await createCustomerMut.mutateAsync([orgId, '', false])
      }
    })()
  }, [customerQuery.fetchStatus, customerQuery.status, customerQuery?.data?.customerId])

  const hideNavbar = (widgetState === 'conversations' && selectedConversationId) || (widgetState === 'help' && selectedArticleId)

  const content = useMemo(() => {
    switch (widgetState) {
      case 'home': {
        return (
          <HomeScreen />
        );
      }
      case 'conversations': {
        return (
          selectedConversationId ?
            <ChatScreen /> :
            <ConversationsScreen />
        )
      }
      case 'help': {
        return (
          selectedArticleId ?
            <ArticleScreen /> :
            <HelpScreen />
        );
      }
    }
  }, [widgetState, selectedConversationId, selectedArticleId])

  return (
    <div className={`${widgetAppearance?.widgetPosition === 'left' ? 'md:absolute md:left-20 md:bottom-20' : 'md:absolute md:right-20 md:bottom-20'}`}>
      {widgetVisibility === 'open' &&
        (
          <div className="flex flex-col h-full w-full md:w-[26rem] md:h-[40rem] shadow-2xl  rounded-3xl max-w-xl dark:bg-gray-900 bg-white animate-fade-left  mb-20 ">
            <div className='w-full h-full overflow-y-scroll rounded-3xl '>
              {content}
            </div>
            {!hideNavbar &&
              <NavBar />
            }
          </div>
        )}
      <div className='mt-10' >
        <StartChatButton></StartChatButton>
      </div>
    </div>
  );
};
