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
  const articles = useArticlesQuery([orgId, locale ?? 'en'], org?.data?.planTier);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer.data?.customerId ?? '')
  const mostRecentConversationItem = conversationItems?.data?.[0]


  return (
    <>
      <div
        className={`dark:bg-gray-900 bg-white flex flex-col justify-start select-none  rounded-l gap-x-2 gap-y-4`}
      >
        <div className="sticky flex p-4 -mb-40 space-y-8 background pb-60 rounded-t-3xl animate-fade-left">
          <MinimiseMobileButton />
          {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
          <div className='mr-6 justify-left animate-fade-left'>{<img src={widgetAppearance?.logo ?? ''} className='object-cover h-16 ' /> ?? (<h1>{org?.data?.name ?? 'Your org'}</h1>)}</div>
          {/* <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[0]} message={conversationItems.data?.[0]?.messages?.slice(-1)[0]} /> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[1]} message={conversationItems.data?.[1]?.messages?.slice(-1)[0]} /> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[2]} message={conversationItems.data?.[2]?.messages?.slice(-1)[0]} /> </div> */}
        </div>
        <div className='z-10 mx-4 text-3xl font-bold text-white '>
          <h4 className='text-gray-200'>
            {translationQuery?.data?.translations?.chatWidget?.['Hi there'] ?? 'Hi there!'}
          </h4>
          <h4>
            {translationQuery?.data?.translations?.chatWidget?.['Chat with us']}
          </h4>
        </div>
        {/* {translationQuery?.data?.translations?.chatWidget?.['How can we help you'] ?? 'How can we help you? '} */}
        {mostRecentConversationItem && mostRecentConversationItem?.messages?.length > 0 ? (
          <div className="mx-4 bg-white border-gray-300 rounded-md shadow-md h-30 gap-y-4 animate-fade-left animate-once">
            <CustomerConversationCard height='28' conversationItem={mostRecentConversationItem} rounded showRecentLabel />
          </div>
        )
          :
          (<div className="h-20 mx-4 mt-4 rounded-md shadow-lg 5 gap-y-4 animate-fade-left animate-once">
            {/* {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />} */}
            {conversationItems.fetchStatus === 'idle' &&
              (<StartConversationCard />)}
            {conversationItems.fetchStatus !== 'idle' && conversationItems.isLoading && (
              <div className="flex flex-col items-start py-4 pl-4 mt-4 bg-white rounded-md gap-y-4 animate-fade-left">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 "></div>
                <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              </div>
            )}
          </div>)
        }


        {articles.isLoading || (articles.isFetched && articles?.data?.length) && <div className="mx-4 mt-4 bg-white border-gray-300 rounded-md shadow-xl dark:bg-gray-900 text-normal gap-y-4 animate-fade-left">

          {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
          <div className="flex place-items-center">
            <button onClick={() => setWidgetState('help')} className="justify-between w-full px-2 m-2 mb-4 text-base font-medium normal-case bg-gray-200 border-0 rounded-md rounded-b-none btn btn-ghost text-normal input input-bordered " >
              <p>{t('Search for help')}</p>
              <BsSearch className='justify-end text-base text-black' />
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
                    return <li key={article.title} className="flex flex-wrap justify-between px-2 py-0 my-0 font-light normal-case border-0 rounded-none place-items-center last:rounded-b-3xl btn btn-ghost text-normal gap-y-0">
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
