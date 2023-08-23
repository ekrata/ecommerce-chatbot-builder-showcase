import { useTranslations } from 'next-intl';
import React, { FC, useEffect } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { v4 as uuidv4 } from 'uuid';

import {
    useConversationItemsByCustomerQuery
} from '@/app/[locale]/(hooks)/queries/useConversationItemsQuery';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
import { DynamicBackground } from '../../../(helpers)/DynamicBackground';
import { useCreateCustomerMut } from '../../../(hooks)/mutations/useCreateCustomerMut';
import { useConfigurationQuery, useOrgQuery } from '../../../(hooks)/queries';
import { useCustomerQuery } from '../../../(hooks)/queries/useCustomerQuery';
import { Avatar } from './Avatar';
import { ChatInput } from './ChatInput';
import { CustomerChatLog } from './CustomerChatLog';

type Inputs = {
  msg: string;
};

export const ChatScreen: FC = ({ }) => {
  const { chatWidget: { widgetState, setWidgetState, setSelectedConversationId, selectedConversationId } } =
    useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const org = useOrgQuery(orgId);
  const customer = useCustomerQuery(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  const createCustomerMut = useCreateCustomerMut(orgId, uuidv4())

  // create customer and assign to conversation if no customer currently found .
  useEffect(() => {
    (async () => {
      if (!conversationItem?.conversation?.customer?.customerId) {
        const res = await createCustomerMut.mutateAsync([orgId, '', false])
      }
    })()
  }, [conversationItems.isSuccess, conversationItem?.conversation?.customer?.customerId])

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }

  return (
    <div className="flex justify-between w-full h-full rounded-3xl animate-fade-left">
      <div className="flex flex-col w-full h-full justify-stretch">
        <div
          className={`background flex place-items-center w-full justify-start rounded-t-lg text-xl font-semibold p-2 gap-x-2    text-white`}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <button><BiChevronLeft className='text-5xl' onClick={() => setSelectedConversationId()}></BiChevronLeft></button>
          {conversationItem?.conversation?.operator && (
            <>
              <Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} />
              {`${conversationItem?.conversation?.operator.name}`}
            </>
          )
          }
          {!conversationItem?.conversation?.operator && (<>
            <div className=''><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            <div className='-ml-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            <div className='mr-4 -ml-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            {`${t('orgName') ?? ''} ${t('Bot') ?? 'Bot'}`}
          </>)}
        </div>
        <div
          className="flex flex-col w-full h-full bg-white border-b-2 border-gray-300 dark:bg-gray-800 dark:border-gray-700 "
          data-testid="chat-log"
        >
          <CustomerChatLog />
        </div>
        <div className='bottom-0 justify-end w-full'>
          <ChatInput />
        </div>
      </div>
    </div>
  );
};
