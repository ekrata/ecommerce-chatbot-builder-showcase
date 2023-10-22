import { useTranslations } from 'next-intl';
import React, { FC, useEffect } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { v4 as uuidv4 } from 'uuid';

import { useCreateCustomerMut } from '@/app/(actions)/mutations/useCreateCustomerMut';
import { useConfigurationQuery } from '@/app/(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from '@/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from '@/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from '@/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from '@/app/(helpers)/DynamicBackground';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
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
  const org = useOrgQuery();
  const orgId = org?.data?.orgId ?? ''

  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  // const createCustomerMut = useCreateCustomerMut(orgId, uuidv4())

  // create customer and assign to conversation if no customer currently found .
  // useEffect(() => {
  //   (async () => {
  //     if (!conversationItem?.customer?.customerId) {
  //       const res = await createCustomerMut.mutateAsync([orgId, '', false])
  //     }
  //   })()
  // }, [conversationItems.isSuccess, conversationItem?.customer?.customerId])

  const widgetAppearance = { ...configuration.data?.channels?.liveChat?.appearance }

  console.log(conversationItem?.operator?.name)
  return (
    <div className="flex justify-between w-full h-full rounded-3xl animate-fade-left">
      <div className="flex flex-col w-full h-full justify-stretch">
        <div
          className={`background flex place-items-center w-full justify-start rounded-t-lg text-xl font-semibold p-2 gap-x-2    text-white`}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data as any} />}
          <button><BiChevronLeft className='text-5xl' onClick={() => setSelectedConversationId()}></BiChevronLeft></button>
          {conversationItem?.operator?.operatorId && (
            <>
              <Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} />
              <h4>{`${conversationItem?.operator?.name ?? `${org?.data?.name} staff`}`}</h4>
            </>
          )
          }
          {!conversationItem?.operator?.operatorId && (<>
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
