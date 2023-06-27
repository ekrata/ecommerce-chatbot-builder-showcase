import { FC,  } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import {  BsSearch } from 'react-icons/bs';
import { useForm } from 'react-hook-form';
import { DynamicBackground } from '../DynamicBackground';
import { BiChevronRight } from 'react-icons/bi';
import { StartConversationCard } from './(messages)/StartConversationCard';
import { useArticlesQuery, useConfigurationQuery, useConversationItemsQuery, useCustomerQuery, useOrgQuery } from '../(hooks)/queries';
import { ConversationCard } from './(messages)/ConversationCard';
import { Avatar } from './(messages)/Avatar';
import { useChatWidgetStore } from '../(actions)/useChatWidgetStore';

type Inputs = {
  msg: string;
};


export const HomeScreen: FC = () => {
  const { relativeTime } = useFormatter();
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const { chatWidget: { setWidgetState } } =
    useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const org = useOrgQuery(orgId)
  const customer = useCustomerQuery(orgId, '')
  const articles = useArticlesQuery(orgId, locale); 
  const conversationItems = useConversationItemsQuery(orgId, customer.data?.customerId ?? '')
  const mostRecentConversationItem = conversationItems?.data?.[0]

  console.log(conversationItems.fetchStatus, conversationItems?.data, conversationItems.isLoading)

  return (
    <>
      <div
        className={`dark:bg-gray-900 bg-white flex flex-col justify-start  rounded-l gap-x-2 gap-y-4`}
      >
        <div className="sticky flex p-4 -mb-40 background pb-60 rounded-t-3xl animate-fade-left">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <div className='mr-6 justify-left animate-fade-left'>{<img src={widgetAppearance?.logo} className='object-cover h-10 mt-10' />   ?? (<h1>{org?.data?.name ?? 'RadCorp'}</h1>)}</div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[0]} message={conversationItems.data?.[0].messages?.slice(-1)[0]}/> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[1]} message={conversationItems.data?.[1]?.messages?.slice(-1)[0]}/> </div>
          <div className='-mr-4 justify-right'><Avatar conversationItem={conversationItems.data?.[2]} message={conversationItems.data?.[2]?.messages?.slice(-1)[0]}/> </div>
        </div>
        <div className=" bg-white shadow-md border-[1px] border-gray-300 h-30  rounded-3xl mx-4 gap-y-4 animate-fade-left animate-once">
          {mostRecentConversationItem && (
            <ConversationCard height='28' conversationId={mostRecentConversationItem.conversation.conversationId} rounded showRecentLabel />
          )}
        </div>
        <div className=" dark:bg-gray-900 bg-white border-gray-300  shadow-md border-[1px] text-normal    rounded-3xl mx-4 gap-y-4 animate-fade-left">
          <div className="flex place-items-center">
              <button onClick={() => setWidgetState('help')}  className="justify-between w-full px-2 m-2 font-semibold normal-case bg-gray-200 border-0 rounded-b-none btn btn-ghost rounded-3xl text-normal input input-bordered " >
                <p>{t('Search for help')}</p>
                <BsSearch className='justify-end text-xl'/>
              </button>
          </div>
            {
            articles.isLoading ? (
                <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
                  <div className="flex w-full place-items-center">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right"/>
                  </div>
                </div>
            ) : (
            <ul className="animate-fade-left">
              {articles?.data?.map((article) => {
                if(article.highlight) {
                  return <li key={article.title} className="flex first:border-gray-300 first:border-t-[1px] place-items-center last:rounded-b-3xl font-light py-0 my-0 flex-wrap justify-between btn btn-ghost text-normal gap-y-0 normal-case  rounded-none border-0  px-2">
                    <p className='basis-5/6 text-start'>{article.title}</p>
                    <BiChevronRight className="text-3xl basis-1/6 justify-right"/>
                    </li>
                }
              })}
            </ul>)}
      </div>

      <div className="border-gray-300  shadow-md border-[1px] h-20 background   rounded-3xl mx-4 gap-y-4 animate-fade-left animate-once">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          {conversationItems.fetchStatus === 'idle' && 
            (<StartConversationCard/>)}
          {conversationItems.fetchStatus !== 'idle' &&  conversationItems.isLoading && (
            <div className="flex flex-col items-center mt-4 gap-y-4 animate-pulse animate-fade-left">
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 "></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 "></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 "></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
            </div>
          )}
      </div>
      <div className='mb-10'>

      </div>
    </div>
    </>
  );
};
