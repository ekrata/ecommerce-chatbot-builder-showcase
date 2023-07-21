'use client'
import { EntityItem } from 'electrodb';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC, ReactNode, useMemo, useState } from 'react';
import { BiChevronRight, BiMailSend, BiSend } from 'react-icons/bi';
import { BsChat, BsSearch, BsWhatsapp, BsX } from 'react-icons/bs';
import { FcSearch } from 'react-icons/fc';

import {
    ConversationChannel, ConversationItem, ConversationItemSearchRes, ConversationTopic,
    conversationTopic
} from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useConversationItemsQuery } from '../../(hooks)/queries/useConversationItemsQuery';
import { ChannelSelect } from './ChannelSelect';
import { OperatorConversationCard } from './OperatorConversationCard';
import { OperatorSelect } from './OperatorSelect';
import { StatusSelect } from './StatusSelect';
import { TopicSelect } from './TopicSelect';

type Inputs = {
  phrase: string;
};

const fetchingArticlesSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
    {[...Array(10)].map(() => (
      <div className="flex w-full place-items-center animate-fade-left">
        <div className='flex flex-col w-full gap-y-2'>
          <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
      </div>))}
  </div>
)



export const ConversationsListView: FC = () => {
  const t = useTranslations('dash');
  const { setConversationState, conversationOperatorView, conversationChannel, conversationTopic, conversationStatus } = useDashStore();
  const operatorSession = useOperatorSession();
  const locale = useLocale();
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const conversationItems = useConversationItemsQuery({ orgId: operatorSession.orgId, expansionFields: ['customerId', 'operatorId'], cursor: cursor, includeMessages: 'true', topic: conversationTopic, channel: conversationChannel, operatorId: conversationOperatorView })

  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'><BsChat />{t('conversations', { count: 0 })}</h5>
      {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
    </div>
  )
  const renderContent = () => {
    if (conversationItems.isFetching) {
      return fetchingArticlesSkeleton
    }
    else {
      return conversationItems?.data?.length ? (
        <ul className="w-full mb-10 animate-fade-left">
          {conversationItems?.data?.map((item) => (
            <li className="flex justify-between w-full  h-16 hover:bg-transparent  px-4 font-semibold text-base normal-case  border-0 border-b-[1px] hover:border-b-[1px] hover:border-gray-300 border-gray-300 rounded-none place-items-center text-normal">
              <OperatorConversationCard height='16' conversationItem={item}></OperatorConversationCard>
            </li>)
          )}
        </ul>) : noData
    }
  }

  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={` bg-white flex  normal-case border-b-[1px] flex-col  place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold gap-x-2   `}
        >
          <div className='flex justify-end w-full place-items-center'>
            <div className='flex place-items-center'>
              <StatusSelect />
              <ChannelSelect />
              <TopicSelect dropdownPosition='end' />
            </div>
            <div className='flex justify-end place-items-center'>
              <button className='btn btn-ghost'>
                <a>
                  <FcSearch className='text-2xl' onClick={() => setConversationState('search')} />
                </a>
              </button>
              <OperatorSelect dropdownPosition='end' />
            </div>

          </div>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full bg-white h-screen  overflow-y-scroll mx-2 `}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
