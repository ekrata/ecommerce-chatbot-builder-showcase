'use client'
import {
    createContext, Dispatch, FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useCreateCustomerMut } from './(actions)/mutations/useCreateCustomerMut';
import { useConfigurationQuery } from './(actions)/queries/useConfigurationQuery';
import { useCustomerQuery } from './(actions)/queries/useCustomerQuery';
import { useOrgQuery } from './(actions)/queries/useOrgQuery';
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
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const { chatWidget: { widgetVisibility, selectedConversationId, selectedArticleId, widgetState } } =
    useChatWidgetStore();
  const configuration = useConfigurationQuery(orgId);
  console.log(configuration?.data)
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  console.log(widgetAppearance)
  const customerQuery = useCustomerQuery(orgId);
  const createCustomerMut = useCreateCustomerMut(orgId, uuidv4())

  // create customer and assign to conversation if no customer currently found.
  useEffect(() => {
    (async () => {
      if (!customerQuery?.data?.customerId && customerQuery.fetchStatus === 'idle' && customerQuery.status === 'error') {
        const customerId = uuidv4()
        const res = await createCustomerMut.mutateAsync([orgId, customerId, { customerId, orgId }])
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
    <div className={`${widgetAppearance?.widgetPosition === 'left' ? 'md:absolute md:left-10 md:bottom-10' : 'md:absolute md:right-10 md:bottom-10 '}`}>
      {widgetVisibility === 'open' &&
        (
          <div className="flex flex-col h-full w-full md:w-[400px] md:h-[600px] shadow-2xl  rounded-3xl max-w-xl dark:bg-gray-900 bg-white animate-fade-left  mb-10 ">
            <div className='w-full h-full overflow-y-scroll rounded-3xl '>
              {content}
            </div>
            {!hideNavbar &&
              <NavBar />
            }
          </div>
        )}
      <div className='right-0 flex flex-row justify-end ' >
        <StartChatButton></StartChatButton>
      </div>
    </div>
  )

};
