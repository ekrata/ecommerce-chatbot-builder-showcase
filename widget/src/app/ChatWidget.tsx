'use client'
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  createContext, Dispatch, FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState
} from 'react';
import { isMobile } from 'react-device-detect';
import { BsX } from 'react-icons/bs';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Config } from 'sst/node/config';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { InteractionHistory } from '@/entities/interaction';
import { Triggers } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useQueryClient } from '@tanstack/react-query';

import { useCreateCustomerMut } from './(actions)/mutations/useCreateCustomerMut';
import { useCreateInteractionMut } from './(actions)/mutations/useCreateInteractionMut';
import { useCreateVisitMut } from './(actions)/mutations/useCreateVisitMut';
import { QueryKey } from './(actions)/queries';
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
import { useWidgetSocketContext } from './WidgetSocketProvider';

export interface ConversationsState {
  selectedConversationId?: string
}

export const ConversationsContext = createContext<[ConversationsState?, Dispatch<ConversationsState>?]>([]);

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const tWidget = useTranslations('chat-widget')
  const org = useOrgQuery()
  // const searchParams = useSearchParams()
  // const botId = searchParams.get('botId')


  const orgId = org?.data?.orgId ?? ''

  const { chatWidget: { widgetVisibility, setWidgetVisibility, selectedConversationId, selectedArticleId, widgetState } } =
    useChatWidgetStore();
  const queryClient = useQueryClient()
  const [buster, setBuster] = useLocalStorage('widgetRqBuster', '')
  const ws = useWidgetSocketContext()
  const configuration = useConfigurationQuery(orgId);
  const visitId = uuidv4()
  const createVisitMut = useCreateVisitMut(orgId, visitId)
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const customerQuery = useCustomerQuery(orgId);
  const createCustomerMut = useCreateCustomerMut(orgId, customerQuery?.data?.customerId ?? '');


  useEffect(() => {
    createVisitMut.mutateAsync([orgId, visitId, { customerId: customerQuery?.data?.customerId ?? '', orgId: orgId, visitId: visitId, url: window.location.href, at: Date.now() }])
  }, [window.location.href])

  const createInteractionMut = useCreateInteractionMut(orgId);
  const [interactionHistory, setInteractionHistory] = useLocalStorage<Partial<Record<keyof typeof Triggers, number>>>('interactionHistory', {})


  // if new customer created, create a first site visit interaction 
  useEffect(() => {
    if (orgId) {
      createInteractionMut.mutateAsync([orgId, { orgId: orgId, visitId: '', operatorId: '', botId: '', customerId: customerQuery?.data?.customerId, channel: 'website', status: 'unassigned', createdAt: Date.now(), type: Triggers.FirstVisitOnSite, lastTriggered: interactionHistory?.FirstVisitOnSite }])
    }
  }, [createCustomerMut.isSuccess && createCustomerMut?.data, orgId])

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
    (ws?.readyState === ReadyState.OPEN && configuration?.isSuccess && customerQuery?.data?.customerId) ?
      <div className='bg-white'>
        <div className={` ${widgetAppearance?.widgetPosition === 'left' ? 'md:absolute md:left-10 md:bottom-10' : 'md:absolute md:right-10 md:bottom-10 '}`}>
          {widgetVisibility === 'open' &&
            (
              <div className="flex flex-col h-screen w-screen md:w-[400px] md:h-[600px] shadow-2xl  rounded-3xl max-w-xl bg-white animate-fade-left  mb-10 ">
                <div className='w-full h-full overflow-y-scroll rounded-3xl '>
                  {content}
                </div>
                {!hideNavbar &&
                  <NavBar />
                }
              </div>
            )}
          {((isMobile && widgetVisibility === 'minimized') || (!isMobile)) &&
            <div className='bottom-0 right-0 flex flex-col justify-end' >
              <StartChatButton ></StartChatButton>

            </div>
          }
          {/* if is in dash  */}
          {process.env.NEXT_PUBLIC_APP_URL && (window?.document.referrer?.includes(process.env.NEXT_PUBLIC_APP_URL) || (window?.document.referrer?.includes(process.env.NEXT_PUBLIC_APP_WIDGET_URL ?? '')))
            &&
            <div className='top-0 right-0 flex flex-col gap-x-2'>
              <button className='z-10 btn btn-sm w-30' onClick={() => {
                console.log('clicked')
                setBuster(uuidv4())
                // customerQuery.remove()
                setInteractionHistory({})
                queryClient.clear()
                // window?.location?.reload()
              }}>
                {tWidget('resetVisitor')}</button>
            </div>
          }
        </div >

      </div >
      : null
  )

};
