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

type Inputs = {
  msg: string;
};


export const HomeScreen: FC = () => {
  const { relativeTime } = useFormatter();
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
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
        className={`dark:bg-gray-900 bg-white flex flex-col justify-start rounded-l gap-x-2 gap-y-4`}
      >
        <div className="flex sticky background -mb-40 pb-60 p-4 rounded-t-3xl animate-fade-left">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <div className='justify-left animate-fade-left mr-6'>{<img src={widgetAppearance?.logo} className='h-10 mt-10 object-cover' />   ?? (<h1>{org?.data?.name ?? 'RadCorp'}</h1>)}</div>
          <div className='justify-right -mr-4'><Avatar conversationItem={conversationItems.data?.[0]} message={conversationItems.data?.[0].messages?.slice(-1)[0]}/> </div>
          <div className='justify-right -mr-4'><Avatar conversationItem={conversationItems.data?.[1]} message={conversationItems.data?.[1]?.messages?.slice(-1)[0]}/> </div>
          <div className='justify-right -mr-4'><Avatar conversationItem={conversationItems.data?.[2]} message={conversationItems.data?.[2]?.messages?.slice(-1)[0]}/> </div>
        </div>
        <div className="border-gray-300 bg-white shadow-md border-[1px] h-30  rounded-3xl mx-4 gap-y-4 animate-fade-left animate-once">
          {mostRecentConversationItem && !conversationItems.isLoading && (
            <ConversationCard conversationId={mostRecentConversationItem.conversation.conversationId} rounded showRecentLabel />
          )}
        </div>
        <div className=" dark:bg-gray-900 bg-white border-gray-300  shadow-md border-[1px] text-normal    rounded-3xl mx-4 gap-y-4 animate-fade-left">
          <div className="flex place-items-center">
              <button  className="btn btn-ghost justify-between bg-gray-200 m-2 rounded-3xl border-0 px-2 text-normal font-semibold rounded-b-none  normal-case input input-bordered w-full " >
                <p>{t('Search for help')}</p>
                <BsSearch className='justify-end text-xl'/>
              </button>
          </div>
            {
            articles.isLoading ? (
                <div className="flex flex-col w-full animate-pulse  rounded-3xl p-2 gap-y-2 my-2">
                  <div className="flex w-full place-items-center">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-gray-300 dark:text-gray-600 justify-right text-4xl"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-gray-300 dark:text-gray-600 justify-right text-4xl"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-gray-300 dark:text-gray-600 justify-right text-4xl"/>
                  </div>
                  <div className="flex w-full place-items-center ">
                    <div className='flex flex-col w-full gap-y-2'>
                      <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                    </div>
                    <BiChevronRight className="text-gray-300 dark:text-gray-600 justify-right text-4xl"/>
                  </div>
                </div>
            ) : (
            <ul className="animate-fade-left">
              {articles?.data?.map((article) => {
                if(article.highlight) {
                  return <li key={article.title} className="flex first:border-gray-300 first:border-t-[1px] place-items-center last:rounded-b-3xl font-light py-0 my-0 justify-between btn btn-ghost text-normal gap-y-0 normal-case  rounded-none border-0  px-2">
                    <p>{article.title}</p>
                    <BiChevronRight className=" justify-right text-3xl"/>
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
      <div className='mb-5'>

      </div>
    </div>
    </>
  );
};
