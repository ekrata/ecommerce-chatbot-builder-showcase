import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { EntityItem } from 'electrodb';
import {  BsSearch } from 'react-icons/bs';
import { useForm } from 'react-hook-form';
import { DynamicBackground } from '../DynamicBackground';
import { BiChevronRight } from 'react-icons/bi';
import { MessageCard } from './(messages)/MessageCard';
import { useQuery } from '@tanstack/react-query';
import { Org } from '@/entities/org';
import { Configuration } from '@/entities/configuration';
import { Customer } from '@/entities/customer';
import { getOrg } from '../(actions)/orgs/getOrg';
import { getConversationItems } from '../(actions)/conversations/getConversationItems';
import { ConversationItem } from '@/entities/conversation';
import { StartConversationCard } from './(messages)/StartConversationCard';
import { Article } from '@/entities/article';
import { getArticles } from '../(actions)/orgs/articles/getArticles';
import { getConfiguration } from '../(actions)/orgs/configurations/getConfiguration';

type Inputs = {
  msg: string;
};


export const HomeScreen: FC = () => {
  const { relativeTime } = useFormatter();
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const t = useTranslations('chat-widget');
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  // const info = useQuery({ queryKey: ['articles'], queryFn: fetchArticles  });
  const org = useQuery<EntityItem<typeof Org>>([orgId, 'org'], async () => await getOrg(orgId));
  const customer = useQuery<EntityItem<typeof Customer>>([orgId, 'customer']);
  const articles = useQuery<EntityItem<typeof Article>[]>([orgId, 'articles'], async() => await getArticles(orgId, locale));
  const conversationItems = useQuery<ConversationItem[]>([orgId, 'conversationItems'], async () => {
    if(orgId && customer?.data?.customerId) {
      return await getConversationItems(orgId, customer?.data.customerId)
    }
    return []
  });
  const mostRecentConversationItem = conversationItems?.data?.[0]
  const configuration = useQuery<EntityItem<typeof Configuration>>([org.data?.orgId, 'configuration'], async () => getConfiguration(orgId));
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}

  return (
    <>
      <div
        className={`dark:bg-gray-900 bg-white flex flex-col justify-start rounded-l gap-x-2 gap-y-6   `}
      >
        <div className="background -mb-40 pb-40 p-4 rounded-t-lg animate-fade-left prose">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <div className='justify-left animate-fade-left'>{<img src={widgetAppearance?.logo} className='w-2/3' />   ?? (<h1>{org?.data?.name ?? 'RadCorp'}</h1>)}</div>
        </div>
      <div className=" dark:bg-gray-900 bg-white border-gray-700 shadow-md shadow-primary/10  border-2 text-normal    rounded-lg mx-4 gap-y-4 animate-fade-left">
          <div className="flex place-items-center">
              <input type="button" value={t('Search for help')} className="btn btn-ghost border-0 px-2 text-normal font-semibold rounded-b-none justify-start normal-case input input-bordered w-full rounded-r-none" placeholder={t('Search for help')}/>
              <div className="btn btn-ghost rounded-lg rounded-l-none rounded-b-none bg-white">
                <BsSearch/>
              </div>
          </div>
            {
            articles.isLoading ? (
                <div className="flex flex-col w-full animate-pulse  rounded-lg p-2 gap-y-2 my-2">
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
                  return <li key={article.title} className="flex place-items-center font-light py-0 my-0 justify-between btn btn-ghost text-normal gap-y-0 normal-case  rounded-none border-0 last:rounded-b-lg px-2">
                    <p>{article.title}</p>
                    <BiChevronRight className="text-gray-400 justify-right text-3xl"/>
                    </li>
                }
              })}
            </ul>)}
      </div>
      <div className=" dark:bg-gray-900   border-gray-700 shadow-md shadow-secondary/10 border-2   rounded-lg mx-4 gap-y-4 animate-fade-left">
          {!conversationItems?.data?.length && 
          <StartConversationCard/> }
          {conversationItems.isLoading && (
            <div className="flex items-center mt-4 space-x-3 animate-pulse animate-fade-left">
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
            </div>
          )}
          {mostRecentConversationItem && !conversationItems.isLoading && (
            <MessageCard conversation={mostRecentConversationItem}/>
          )}
      </div>
      </div>
    </>
  );
};
