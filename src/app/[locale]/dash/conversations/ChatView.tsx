import { EntityItem } from 'electrodb';
import { Link, useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  ConversationItemSearchKey, conversationItemSearchKey
} from 'packages/functions/app/api/src/conversations/search';
import { FC, ReactNode, useMemo, useState } from 'react';
import { ChangeHandler, SubmitHandler, useForm } from 'react-hook-form';
import { BiChevronLeft, BiChevronRight, BiSend } from 'react-icons/bi';
import { BsSearch, BsX } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { useDebounce } from 'usehooks-ts';

import { Article, ArticleCategory, ArticleSearchRes } from '@/entities/article';
import { ConversationItem, ConversationItemSearchRes } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { Avatar } from '../../(chat-widget)/(screens)/(messages)/Avatar';
import { ConversationCard } from '../../(chat-widget)/(screens)/(messages)/ConversationCard';
import { highlightMatches } from '../../(helpers)/highlightMatches';
import {
  useArticlesQuery, useConfigurationQuery, useOrgQuery, useSearchArticlesQuery
} from '../../(hooks)/queries';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
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



export const ChatView: FC = ({ conversationItem }) => {
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const locale = useLocale();
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversationId')
  const conversationItemQuery = useConversationItemQuery(orgId, conversationId ?? '')


  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`text-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold p-3 gap-x-2   `}
        >
          <Link className='justify-start' key={'/dash'}
            href={{
              pathname: '/dash',
            }}>
            <BiChevronLeft className='text-5xl'></BiChevronLeft>
          </Link>
          {conversationItem?.conversation?.operator && (
            <>
              <Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} />
              {`${conversationItem?.conversation?.operator.name}`}
            </>
          )
          }
          {!conversationItem?.conversation?.operator && (<>
            <div className=''><Avatar conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]} /> </div>
            {`${t('orgName') ?? ''} ${t('Bot') ?? 'Bot'}`}
          </>)}
        </div>
      </div>
      <div
        className={`flex flex-col place-items-center  w-full  overflow-y-scroll mx-2 `}
      >
        {conversationItemQuery?.isFetching && fetchingConversationItemSkeleton}
        <OperatorChatLog />
        <OperatorChatInput />
      </div>
    </div >
  );
};
