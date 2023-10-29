import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsChat } from 'react-icons/bs';
import { FcImport } from 'react-icons/fc';

import { ConversationItem } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useConversationItemsQuery } from '../../../(hooks)/queries/useConversationItemsQuery';
import { CustomerAvatar } from './CustomerAvatar';
import { OperatorChatInput } from './OperatorChatInput';
import { OperatorChatLog } from './OperatorChatLog';

type Inputs = {
  phrase: string;
};

const fetchingConversationItemSkeleton = (
  <div className="flex flex-col w-full h-screen p-2 bg-white gap-y-2">
    {[...Array(15)].map(() => (
      <div className="flex w-full place-items-center animate-fade-left">
        <div className='flex flex-col w-full gap-y-6'>
          <div className="h-2.5 w-1/2 left-0 bg-gray-300 justify-end rounded-full dark:bg-gray-600" />
          <div className="right-0 w-1/2 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
      </div>))}
  </div>
)

export const ChatView: FC = () => {
  const t = useTranslations('chat-widget');
  const tDash = useTranslations('dash');
  const { setConversationState, conversationListFilter, setConversationListFilter } = useDashStore();
  const searchParams = useSearchParams()
  const [operatorSession] = useAuthContext();
  const conversationId = searchParams?.get('conversationId')
  const [conversationItem, setConversationItem] = useState<ConversationItem | undefined>(undefined)

  const conversationItemsQuery = useConversationItemsQuery({ ...conversationListFilter })
  useEffect(() => {
    if (conversationId) {
      setConversationItem(conversationItemsQuery?.data?.pages?.flatMap(data => data.data).find(conversation => conversation.conversationId === conversationId))
    } else {
      setConversationItem(undefined)
    }
  }, [!conversationItem, conversationItemsQuery?.dataUpdatedAt, conversationId])

  const noData = (
    <div className='flex flex-col justify-center w-full h-screen bg-white place-items-center gap-y-1 gap-x-2'>
      <h5 className='flex font-semibold'><BsChat />{tDash('conversations', { count: 0 })}</h5>
      {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
    </div>
  )

  const renderContent = useMemo(() => {
    return (
      <div className="flex justify-between w-full h-screen max-h-screen ">
        <div className="flex flex-col w-full h-screen max-h-screen place-items-center ">
          <div
            className={`bg-white border-b-[1px] flex flex-row gap-y-2 h-12 place-items-center animated-flip-down w-full justify-start  text-sm flex-wrap p-3 gap-x-2 `}
          >
            {isMobile &&
              <Link className='justify-start' key={'/dash'}
                href={{
                  pathname: '/dash',
                }}>
                <BiChevronLeft className='text-4xl '></BiChevronLeft>
              </Link>
            }
            {!conversationItemsQuery?.isFetched &&
              <div className='flex flex-col w-full gap-y-2 animate-pulse'>
                <div className="w-1/3 h-full py-1 bg-gray-300 rounded-md dark:bg-gray-600" />
              </div>
            }
            {conversationItem?.customer?.name}
            {conversationItem?.customer && (
              <a onClick={() => setConversationState('customerInfo')} className='flex flex-row place-items-center gap-x-2'>
                <CustomerAvatar customer={conversationItem?.customer} conversationItem={conversationItem} />
                <p>{`${conversationItem.customer?.name ?? conversationItem?.customer?.email ?? conversationItem?.customer?.customerId}`}</p>
              </a>
            )}
          </div>
          <div
            className={`flex flex-col place-items-center  w-full  h-screen  justify-stretch  overflow-y-scroll mx-2 `}
          >
            {!conversationItemsQuery?.isFetched && fetchingConversationItemSkeleton}
            {!conversationItem && conversationItemsQuery?.isFetched && noData}
            {conversationItem && <OperatorChatLog conversationItem={conversationItem} />}
            {conversationItem && <div className='w-full b-0'>
              <OperatorChatInput conversationItem={conversationItem} />
            </div>}

          </div>

        </div>

      </div >
    )
  }, [conversationId, searchParams?.get('conversationId'), conversationItem?.conversationId, conversationItemsQuery?.dataUpdatedAt])

  return renderContent
};
