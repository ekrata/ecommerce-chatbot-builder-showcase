import { EntityItem } from 'electrodb';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ConversationItemSearchKey, conversationItemSearchKey
} from 'packages/functions/app/api/src/conversations/search';
import { FC, ReactNode, useMemo, useState } from 'react';
import { BiChevronRight, BiMailSend, BiSend } from 'react-icons/bi';
import { BsChat, BsSearch, BsWhatsapp, BsX } from 'react-icons/bs';

import {
  ConversationChannel, ConversationItem, ConversationItemSearchRes, ConversationTopic
} from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { ConversationCard } from '../../(chat-widget)/(screens)/(messages)/ConversationCard';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useConversationItemsQuery } from '../../(hooks)/queries/useConversationItemsQuery';
import { ChannelSelect } from './ChannelSelect';
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
  const { setConversationState, conversationOperatorView } = useDashStore();
  const operatorSession = useOperatorSession();
  const locale = useLocale();
  const [queryCursor, setQueryCursor] = useState<string | undefined>(undefined)
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | undefined>(undefined);
  const [topicFilter, setTopicFilter] = useState<ConversationTopic | undefined>(undefined);

  const conversationItems = useConversationItemsQuery({ orgId: operatorSession.orgId, expansionFields: ['customerId', 'operatorId'], cursor: queryCursor, includeMessages: 'true', topic: topicFilter, channel: channelFilter, type: 'chat' })

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
              <ConversationCard height='16' conversationId={item.conversation.conversationId}></ConversationCard>
            </li>)
          )}
        </ul>) : noData
    }
  }

  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={` bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold p-3 gap-x-2   `}
        >
          <div className='flex justify-center w-full place-items-center'>
            <ChannelSelect />
            <TopicSelect />
            <div className='flex justify-end'>
              <BsSearch className='text-lg ' />
              <OperatorSelect />
            </div>
          </div>
          <div>
            <StatusSelect />
          </div>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full  overflow-y-scroll mx-2 `}
        >

          {renderContent()}
        </div>
      </div>
    </div>
  );
};
