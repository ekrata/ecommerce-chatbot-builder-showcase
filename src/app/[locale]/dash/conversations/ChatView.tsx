import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';
import { isMobile } from 'react-device-detect';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { FcImport } from 'react-icons/fc';

import { ConversationItem } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { CustomerAvatar } from './CustomerAvatar';
import { OperatorChatInput } from './OperatorChatInput';
import { OperatorChatLog } from './OperatorChatLog';

type Inputs = {
  phrase: string;
};

const fetchingConversationItemSkeleton = (
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

interface Props {
  conversationItem?: ConversationItem
}

export const ChatView: FC = () => {
  const t = useTranslations('chat-widget');
  const { setConversationState } = useDashStore();
  const searchParams = useSearchParams()
  const operatorSession = useOperatorSession();
  const conversationId = searchParams?.get('conversationId')
  const conversationItemQuery = useConversationItemQuery(operatorSession.orgId, conversationId ?? '')
  const conversationItem = conversationItemQuery.data?.[0]

  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white border-b-[1px]  flex flex-row gap-y-2 place-items-center animated-flip-down w-full justify-start rounded-t-lg text-sm flex-wrap p-3 gap-x-2 `}
        >
          {isMobile &&
            <Link className='justify-start' key={'/dash'}
              href={{
                pathname: '/dash',
              }}>
              <BiChevronLeft className='text-4xl '></BiChevronLeft>
            </Link>
          }
          {conversationItem?.conversation?.customer?.name}
          {conversationItem?.conversation?.customer && (
            <a onClick={() => setConversationState('customerInfo')} className='flex flex-row place-items-center gap-x-2'>
              <CustomerAvatar conversationItem={conversationItem} message={conversationItem.messages?.slice(-1)[0]} />
              <p>{`${conversationItem.conversation?.customer?.name ?? conversationItem.conversation?.customer?.email ?? conversationItem.conversation?.customer?.id}`}</p>
              <FcImport className='text-3xl rotate-180 rounded-full' />
            </a>
          )}
        </div>
        <div
          className={`flex flex-col place-items-center  w-full  overflow-y-scroll mx-2 `}
        >
          {conversationItemQuery?.isFetching && fetchingConversationItemSkeleton}
          <OperatorChatLog conversationItem={conversationItem} />
          <OperatorChatInput />
        </div>
      </div>
    </div >
  );
};
