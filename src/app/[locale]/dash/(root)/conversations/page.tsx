'use client'

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { ChatView } from './ChatView';
import { ConversationsListView } from './ConversationsListView';
import { ConversationsSearchView } from './ConversationsSearchView';
import { CustomerInfoView } from './CustomerInfoView';

export default function Page() {
  const searchParams = useSearchParams();
  const operator = useAuthContext()
  const t = useTranslations('dash');
  const { conversationState } = useDashStore()

  // E.g. `/dashboard?page=2&order=asc`
  const conversationId = searchParams?.get('conversationId');

  const renderMobile = useMemo(() => {
    if (conversationId && conversationState !== 'customerInfo') {
      return <ChatView />
    }
    else if (conversationId && conversationState === 'customerInfo') {
      return <CustomerInfoView />
    } else if (conversationState === 'list') {
      return <ConversationsListView />
    } else if (conversationState === 'search') {
      return <ConversationsSearchView />
    } else {
      return <ConversationsListView />
    }
  }, [conversationState, conversationId])

  const render = useMemo(() => (
    <div className="grid w-full max-h-screen grid-cols-12">
      <div className='h-screen col-span-3'>
        {conversationState === 'list' && <ConversationsListView></ConversationsListView>}

        {conversationState === 'search' && <ConversationsSearchView></ConversationsSearchView>}
      </div>
      <div className='h-screen col-span-6 shadow-lg border-l-[1px]'>
        <ChatView />
      </div>
      <div className='col-span-3  shadow-lg border-l-[1px]'>
        <CustomerInfoView></CustomerInfoView>
      </div>
    </div>
  ), [conversationState])

  return isDesktop ? render : renderMobile;
}