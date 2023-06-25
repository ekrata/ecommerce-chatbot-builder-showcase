import { FC, useContext } from 'react';
import {  useTranslations } from 'next-intl';
import { CustomerChatLog } from './CustomerChatLog';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { DynamicBackground } from '../../DynamicBackground';
import React from 'react';
import { ChatInput } from './ChatInput';
import { ConversationsContext } from '../../ChatWidget';
import { useConfigurationQuery, useConversationItemsQuery, useCustomerQuery, useOrgQuery } from '../../(hooks)/queries';
import { Avatar } from './Avatar';
import { BiChevronLeft } from 'react-icons/bi';
import { getItem } from '../../(helpers)/helpers';

type Inputs = {
  msg: string;
};

export const ChatScreen: FC = ({}) => {
  const { chatWidget: {widgetState,  setWidgetState, selectedConversationId} } =
    useChatWidgetStore();
  const [conversationsState] = useContext(ConversationsContext);
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const org = useOrgQuery(orgId);
  const customer = useCustomerQuery(orgId, '');
  const conversationItems = useConversationItemsQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  const configuration =  useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}

  return (
    <div className="flex rounded-3xl justify-between w-full h-full animate-fade-left">
      <div className="flex flex-col justify-stretch w-full h-full">
        <div
          className={`background flex place-items-center w-full justify-start rounded-t-lg text-xl font-semibold p-2 gap-x-2    text-white`}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
          <button><BiChevronLeft className='text-5xl' onClick={() => setWidgetState('messages')}></BiChevronLeft></button>
          {conversationItem?.conversation?.operator && (
            <>
              <Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]}/> 
              {`${conversationItem?.conversation?.operator.name}`}
            </>
            )
            }
          {!conversationItem?.conversation?.operator && (<>
            <div className=''><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]}/> </div>
            <div className='-ml-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]}/> </div>
            <div className='-ml-4 mr-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]}/> </div>
            {`${t('orgName') ?? ''} ${t('Bot') ?? 'Bot'}`}
          </>)}
        </div>
        <div
          className="flex flex-col w-full h-full bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 "
          data-testid="chat-log"
        >
          <CustomerChatLog />
        </div>
        <div className='justify-end bottom-0 w-full'>
          <ChatInput/>
        </div>
      </div>
    </div>
  );
};