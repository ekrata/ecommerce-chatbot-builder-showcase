import { FC } from 'react';
import {  useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { BiChevronRight, BiSend } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { DynamicBackground } from '../DynamicBackground';
import { useChatWidgetStore } from '../(actions)/useChatWidgetStore';
import { useConfigurationQuery, useOrgQuery, useCustomerQuery, useArticlesQuery } from '../(hooks)/queries';

type Inputs = {
  msg: string;
};

export const ConversationsScreen: FC = () => {
  const { chatWidget: {setWidgetState} } = useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const org = useOrgQuery(orgId)
  const customer = useCustomerQuery(orgId, '')
  const articles = useArticlesQuery(orgId, locale)

  return (
    <div className="flex rounded-3xl justify-between w-full h-full">
      <div className="flex flex-col  place-items-center w-full h-full">
        <div
          className={`background text-white flex place-items-center w-full justify-center rounded-t-lg text-xl font-semibold p-2 px-6 gap-x-2   `}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
          {t('Help')}
          <div className="flex place-items-center rounded-3xl">
              <button className="btn rounded-3xl" placeholder={t('Search for help')}>
                {t('Search for help')}
              </button>
              <div className="btn btn-ghost rounded-3xl hover:rounded-3xl rounded-l-none rounded-b-none bg-white">
                <BsSearch/>
              </div>
          </div>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full  overflow-y-scroll `}
        >
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
                  return <li key={article.title} className="flex place-items-center font-light py-0 my-0 justify-between btn btn-ghost text-normal gap-y-0 normal-case  rounded-none border-0 last:rounded-b-lg px-2">
                    <p>{article.title}</p>
                    <BiChevronRight className="text-gray-400 justify-right text-3xl"/>
                    </li>
                }
              })}
            </ul>)}
        </div>
        <button className="btn gap-x-2 border-0 justify-center normal-case background rounded-3xl shadow-lg  fixed bottom-16">{t('Send us a message')}
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            <BiSend className='text-xl'/>
          </button>
      </div>
    </div>
  );
};
