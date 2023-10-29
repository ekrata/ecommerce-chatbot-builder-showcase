'use client'
import { EntityItem } from 'electrodb';
import { useLocale, useTranslations } from 'next-intl';
import { FC } from 'react';
import { isMobile } from 'react-device-detect';
import { useForm } from 'react-hook-form';
import { BiChevronRight } from 'react-icons/bi';
import { BsSearch, BsX } from 'react-icons/bs';

import { Configuration } from '@/entities/configuration';

import { useArticlesQuery } from '../(actions)/queries/useArticlesQuery';
import { useConfigurationQuery } from '../(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from '../(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from '../(actions)/queries/useCustomerQuery';
import { useOrgQuery } from '../(actions)/queries/useOrgQuery';
import { useTranslationQuery } from '../(actions)/queries/useTranslationQuery';
import { useChatWidgetStore } from '../(actions)/useChatWidgetStore';
import { DynamicBackground } from '../(helpers)/DynamicBackground';
import { MinimiseMobileButton } from '../MinimiseMobileButton';
import { Avatar } from './(messages)/Avatar';
import { CustomerConversationCard } from './(messages)/CustomerConversationCard';
import { StartConversationCard } from './(messages)/StartConversationCard';

type Inputs = {
  msg: string;
};


export const HomeScreen: FC = () => {
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const locale = useLocale()
  const { chatWidget: { setWidgetState, setWidgetVisibility } } =
    useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const translationQuery = useTranslationQuery(orgId, locale)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const customer = useCustomerQuery(orgId)
  const articles = useArticlesQuery([orgId, locale ?? 'en']);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer.data?.customerId ?? '')
  const mostRecentConversationItem = conversationItems?.data?.[0]


  return (
    <>
      <div
        className={`dark:bg-gray-900 bg-white flex flex-col justify-start  rounded-l gap-x-2 gap-y-4`}
      >
        <div className="sticky flex p-4 -mb-32 space-y-8 background pb-60 rounded-t-3xl animate-fade-left">
          <MinimiseMobileButton />
          {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
          <div className='mr-6 justify-left animate-fade-left'>{<img src={widgetAppearance?.logo ?? ''} className='object-cover h-16 mt-10' /> ?? (<h1>{org?.data?.name ?? 'Your org'}</h1>)}</div>
          {/* <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[0]} message={conversationItems.data?.[0]?.messages?.slice(-1)[0]} /> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[1]} message={conversationItems.data?.[1]?.messages?.slice(-1)[0]} /> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[2]} message={conversationItems.data?.[2]?.messages?.slice(-1)[0]} /> </div> */}
        </div>
        <h1 className='z-10 mx-4 text-3xl font-bold text-white'>
          {translationQuery?.data?.translations?.chatWidget?.['Chat with us'] ?? 'Welcome! 👋'}
        </h1>
        <h1 className='z-10 mx-4 font-semibold text-white texl-xl'>
          {/* {translationQuery?.data?.translations?.chatWidget?.['How can we help you'] ?? 'How can we help you? '} */}
        </h1>
        {mostRecentConversationItem && mostRecentConversationItem?.messages?.length && (
          <div className=" bg-white shadow-md border-[1px] border-gray-300 h-30  rounded-3xl mx-4 gap-y-4 animate-fade-left animate-once">
            <CustomerConversationCard height='28' conversationItem={mostRecentConversationItem} rounded showRecentLabel />
          </div>
        )}

        <div className=" backdrop-blur-3xl bg-white/10 hover:bg-white/5  shadow-xl border-[1px] h-20    rounded-3xl mx-4 gap-y-4 animate-fade-left animate-once">
          {/* {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />} */}
          {conversationItems.fetchStatus === 'idle' &&
            (<StartConversationCard />)}
          {conversationItems.fetchStatus !== 'idle' && conversationItems.isLoading && (
            <div className="flex flex-col items-start mt-4 gap-y-4 animate-fade-left">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 "></div>
              <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
          )}
        </div>

        {articles.isLoading || (articles.isFetched && articles?.data?.length) && <div className=" dark:bg-gray-900 mt-4 bg-white border-gray-300  shadow-md border-[1px] text-normal    rounded-3xl mx-4 gap-y-4 animate-fade-left">
          <div className="flex place-items-center">
            <button onClick={() => setWidgetState('help')} className="justify-between w-full px-2 m-2 mb-4 font-semibold normal-case bg-gray-200 border-0 rounded-b-none btn btn-ghost rounded-3xl text-normal input input-bordered " >
              <p>{t('Search for help')}</p>
              <BsSearch className='justify-end text-xl' />
            </button>
          </div>
          {
            articles.isLoading ? (
              <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
                <div className="flex w-full place-items-center">
                  <div className='flex flex-col w-full gap-y-2'>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
                  </div>
                  <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
                </div>
                <div className="flex w-full place-items-center ">
                  <div className='flex flex-col w-full gap-y-2'>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
                  </div>
                  <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
                </div>
                <div className="flex w-full place-items-center ">
                  <div className='flex flex-col w-full gap-y-2'>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
                  </div>
                  <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
                </div>
                <div className="flex w-full place-items-center ">
                  <div className='flex flex-col w-full gap-y-2'>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
                  </div>
                  <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
                </div>
              </div>
            ) : (
              <ul className="animate-fade-left">
                {articles?.data?.map((article) => {
                  if (article.highlight) {
                    return <li key={article.title} className="flex first:border-gray-300 first:border-t-[1px] place-items-center last:rounded-b-3xl font-light py-0 my-0 flex-wrap justify-between btn btn-ghost text-normal gap-y-0 normal-case  rounded-none border-0  px-2">
                      <p className='basis-5/6 text-start'>{article.title}</p>
                      <BiChevronRight className="text-3xl basis-1/6 justify-right" />
                    </li>
                  }
                })}
              </ul>)}
        </div>
        }


      </div>
      <div className='mb-10'>

      </div>
    </>
  );
};
