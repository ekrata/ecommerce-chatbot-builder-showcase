import { useFormatter, useTranslations } from 'next-intl';
import React, { FC, useEffect } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from 'src/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from 'src/app/(helpers)/DynamicBackground';
import { MinimiseMobileButton } from 'src/app/MinimiseMobileButton';
import { v4 as uuidv4 } from 'uuid';

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
  const { relativeTime } = useFormatter()
  const org = useOrgQuery();
  const orgId = org?.data?.orgId ?? ''

  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  console.log(conversationItem)


  const averageWaitTime = org?.data?.averageUnassignedWaitTime?.slice(-1)?.[0]?.averageWaitTime
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

  const averageWaitTimeElement = (<div className="flex text-xs font-thin gap-x-1 ">
    <p>{`${t('We typically reply in under')} `}</p>
    <p className="">
      {averageWaitTime != null && `${relativeTime(averageWaitTime,
        Date.now()
      ).split(' ago')[0]}`}
    </p>
  </div>)

  return (
    <div className="flex justify-between w-full h-full rounded-3xl ">
      <div className="flex flex-col w-full h-full justify-stretch">
        <div
          className={`background flex place-items-center w-full select-none  justify-start rounded-t-lg text-xl font-semibold p-2 gap-x-2    text-white`}
        >
          <MinimiseMobileButton />
          {configuration.data && <DynamicBackground configuration={configuration.data as any} />}
          <button><BiChevronLeft className='text-3xl' onClick={() => setSelectedConversationId()}></BiChevronLeft></button>
          {conversationItem?.operator?.operatorId && (
            <div className='flex flex-row'>
              <Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} />
              <div className='flex flex-col'>
                <h4>{`${conversationItem?.operator?.name ?? `${org?.data?.name} staff`}`}</h4>
                {averageWaitTimeElement}
              </div>
            </div>
          )
          }
          {!conversationItem?.operator?.operatorId && (<>

            <div className=''><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            <div className='-ml-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            <div className='mr-4 -ml-4'><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            <div className='flex flex-col'>
              {`${org?.data?.name ?? ''} ${t('Staff')}`}
              {averageWaitTime && averageWaitTimeElement}
            </div>
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
