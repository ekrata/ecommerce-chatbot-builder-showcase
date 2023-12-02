'use client'

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BiChat, BiChevronRight } from 'react-icons/bi';
import { BsChat } from 'react-icons/bs';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FcSearch } from 'react-icons/fc';
import { MdFilterAltOff } from 'react-icons/md';
import { RiFilterOffFill } from 'react-icons/ri';

import {
  ConversationFilterParams
} from '@/packages/functions/app/api/src/conversations/listByLastMessageSentAt';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useConversationItemsQuery } from '../../../(hooks)/queries/useConversationItemsQuery';
import { Pagination } from '../Pagination';
import { ChannelSelect } from './ChannelSelect';
import { OperatorConversationCard } from './OperatorConversationCard';
import { OperatorSelect } from './OperatorSelect';
import { StatusSelect } from './StatusSelect';
import { TopicSelect } from './TopicSelect';

type Inputs = {
  phrase: string;
};

const fetchingArticlesSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-4">
    {[...Array(20)].map(() => (
      <div className='flex flex-row gap-x-2 place-items-center gap-y-8'>
        <div className="w-6 h-6 p-2 bg-gray-200 rounded-full animate-pulse "></div>
        <div className="flex w-full place-items-center animate-fade-left">
          <div className='flex flex-col w-full gap-y-2'>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
          </div>
          <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
        </div>
      </div>
    ))}
  </div>
)

export const ConversationsListView: FC = () => {
  const t = useTranslations('dash');
  const { setConversationListFilter, setConversationState } = useDashStore();
  const conversationListFilter = useDashStore((state) => state.conversationListFilter)
  const conversationId = useSearchParams()?.get('conversationId')


  const [operatorSession] = useAuthContext();
  const locale = useLocale();
  const [page, setPage] = useState<number>(0)
  const [pageCursors, setPageCursors] = useState<(string | null | undefined)[]>([])

  const conversationItems = useConversationItemsQuery({ ...conversationListFilter, cursor: pageCursors?.[page] ?? undefined })

  useEffect(() => {
    // update last cursor
    if (operatorSession?.orgId) {
      // console.log(pageCursors, conversationItems?.data?.cursor)
      setPageCursors([...new Set([...pageCursors, conversationItems?.data?.cursor])])
      setConversationListFilter({
        ...conversationListFilter, cursor: pageCursors[page] ?? undefined, orgId: operatorSession?.orgId, expansionFields: ['customerId', 'operatorId'], includeMessages: 'true'
      })
    }
  }, [conversationItems?.data?.cursor, conversationItems?.dataUpdatedAt, page])


  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold gap-x-2 place-items-center'><BiChat className='text-xl' />{t('conversations', { count: 0 })}</h5>
      {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
    </div>
  )

  const renderContent = useMemo(() => {
    console.log('updating')
    if (!operatorSession?.operatorId || conversationItems?.isLoading) {
      return fetchingArticlesSkeleton
    }
    else {
      return conversationItems.data?.data?.length ? (
        <ul className="w-full h-screen animate-fade-left">
          {conversationItems?.data?.data?.map((item) => {
            if (item?.conversationId) {
              return <li key={item?.conversationId} className={`flex justify-between overflow-clip  -16 border-b-[1px] hover:bg-transparent  truncate font-semibold text-base normal-case  border-0   hover:border-gray-300 border-gray-300 rounded-none place-items-center text-normal ${conversationId === item?.conversationId && 'bg-gray-300'}`} >
                <OperatorConversationCard height='20' conversationItem={item}></OperatorConversationCard>
              </li>
            }
          })}
          <div className='fixed w-full bg-white '>
            <div className='flex justify-between w-full mb-2'>
              <Pagination pageState={[page ?? 0, setPage]} currentCursor={pageCursors[page ?? 0]} limitPerPage={10} pageItemCount={conversationItems?.data?.data?.length} />
            </div>
          </div>
        </ul >
      ) : noData
    }
  }, [conversationItems?.data, page, setPage, conversationId, conversationItems?.dataUpdatedAt])

  return (
    <div className="flex justify-between w-full h-full ">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white flex  normal-case border-b-[1px] flex-col  place-items-center animated-flip-down w-full justify-center  text-lg font-semibold gap-x-2   `}
        >
          <div className='z-10 flex justify-end w-full shadow place-items-center animate-fade-down'>
            <div className='flex place-items-center gap-x-0'>
              <button className=' btn btn-ghost disabled:bg-transparent place-items-center' disabled={conversationListFilter?.topic == undefined && conversationListFilter?.status == undefined && conversationListFilter?.channel == undefined} onClick={() =>
                setConversationListFilter({
                  ...conversationListFilter, operatorId: operatorSession?.operatorId, expansionFields: ['customerId', 'operatorId'], topic: undefined, status: undefined, channel: undefined
                })
              }>
                <RiFilterOffFill className="text-xl " />
              </button>
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
          className={`flex flex-col place-items-center w-full bg-white h-screen  overflow-y-scroll mx-2 `}
        >
          {renderContent}
        </div>
      </div>
    </div>
  );
};
