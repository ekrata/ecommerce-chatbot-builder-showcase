import { Dispatch, FC, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import {  useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { ConversationCard } from './ConversationCard';
import { ChatScreen } from './ChatScreen';
import { BiSend } from 'react-icons/bi';
import { DynamicBackground } from '../../DynamicBackground';
import { useConfigurationQuery, useOrgQuery, useCustomerQuery, useArticlesQuery, useConversationItemsQuery } from '../../(hooks)/queries';
import { StartConversationCard } from './StartConversationCard';



type Inputs = {
  msg: string;
};



export const ConversationsScreen: FC = () => {
  const { chatWidget: {setWidgetState} } = useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const org = useOrgQuery(orgId)
  const customer = useCustomerQuery(orgId, '')
  const conversationItems = useConversationItemsQuery(orgId, customer.data?.customerId ?? '')

  return (
    <div className="flex rounded-lg justify-between w-full h-full">
      <div className="flex flex-col  place-items-center w-full h-full">
        <div
          className={`background text-white flex place-items-center w-full justify-center rounded-t-lg text-xl font-semibold p-2 px-6 gap-x-2   `}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
          {t('Messages')}
        </div>
        <div
          className={`flex flex-col place-items-center  w-full  overflow-y-scroll `}
        >
          {conversationItems.isLoading && [...Array(3)].map(() => <ConversationCard/>)}
          {conversationItems.isSuccess &&  
            conversationItems.data.map((conversationItem) => (
              <div key={conversationItem.conversation.conversationId} className="divide-y-2 border-b-2 w-full">
                <ConversationCard conversationId={conversationItem.conversation.conversationId}/>
              </div>
          ))}
          {(conversationItems.isSuccess && !conversationItems.data.length &&  
            <StartConversationCard/>
          )}
        </div>
        <button className="btn gap-x-2 border-0 justify-center normal-case background rounded-lg shadow-lg  fixed bottom-16">{t('Send us a message')}
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            <BiSend className='text-xl'/>
          </button>
      </div>
    </div>
  );
};
