import { Dispatch, FC, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import {  useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { MessageCard } from './MessageCard';
import { ChatScreen } from './ChatScreen';
import { ConversationItem } from '@/entities/conversation';
import { useQuery } from '@tanstack/react-query';
import { getConversationItems } from '../../(actions)/conversations/getConversationItems';
import { EntityItem } from 'electrodb';
import { Org } from '@/entities/org';
import { Customer } from '@/entities/customer';
import { getOrg } from '../../(actions)/orgs/getOrg';
import { Configuration } from '@/entities/configuration';
import { getConfiguration } from '../../(actions)/orgs/configurations/getConfiguration';
import { StartConversationCard } from './StartConversationCard';
import { BiSend } from 'react-icons/bi';
import { DynamicBackground } from '../../DynamicBackground';

export interface ConversationsState {
  selectedConversationId?: string
}

export const ConversationsContext = createContext<[ConversationsState?, Dispatch<ConversationsState>?]>([]);

type Inputs = {
  msg: string;
};

export const MessagesScreen: FC = () => {
  const { chatWidget: {setWidgetState} } = useChatWidgetStore();
  const [conversationsState, setConversationsState] = useState<ConversationsState>({})
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const org = useQuery<EntityItem<typeof Org>>([orgId, 'org'], async () => getOrg(orgId));
  const customer = useQuery<EntityItem<typeof Customer>>([orgId, 'customer'])
  const conversationItems = useQuery<ConversationItem[]>([orgId, 'conversationItems'], async () => {
    if(orgId && customer?.data?.customerId) {
      return await getConversationItems(orgId, customer?.data.customerId)
    }
    return []
  });
  const mostRecentConversationItem = conversationItems?.data?.slice(-1)[0]
  const configuration = useQuery<EntityItem<typeof Configuration>>([org.data?.orgId, 'configuration'], async () => getConfiguration(process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''));
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  console.log(conversationItems.data)

  return (
    <ConversationsContext.Provider value={[conversationsState, setConversationsState]}>
      <div className="flex rounded-lg justify-between w-full h-full">
        <div className="flex flex-col justify-between place-items-center w-full h-full">
          <div
            className={`background flex place-items-center w-full justify-center rounded-t-lg text-xl font-semibold p-2 px-6 gap-x-2 border-b-2  `}
          >
            {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            {t('Messages')}
          </div>
          <div
            className={`flex place-items-center justify-between w-full p-2 px-6 gap-x-2 border-b-2 `}
          >

            {conversationItems.isLoading && (
              <>
                <MessageCard />
                <MessageCard />
              </>
            )
            } 
            {(conversationItems.isSuccess && !conversationItems.data.length && <MessageCard/>)}
            {(conversationItems.isSuccess && conversationItems.data.length) && (!conversationsState.selectedConversationId ?
              conversationItems.data.map((conversationItem) => (
              <MessageCard conversation={conversationItem}/>
            )) :  
              <ChatScreen/>  
            )}
          </div>
          <button className="btn gap-x-2 border-0 justify-center normal-case background rounded-lg shadow-lg absolute md:bottom-20 ">{t('Send us a message')}
            {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            <BiSend className='text-xl'/>
            </button>

        </div>
          

      </div>
    </ConversationsContext.Provider>
  );
};
