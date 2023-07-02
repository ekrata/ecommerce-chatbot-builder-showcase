import { FC, ReactNode, useMemo, useState } from 'react';
import {  useLocale, useTranslations } from 'next-intl';
import { ChangeHandler, SubmitHandler, useForm } from 'react-hook-form';
import { BiChevronLeft, BiChevronRight, BiSend } from 'react-icons/bi';
import { BsSearch, BsX } from 'react-icons/bs';
import { useDashStore } from '../(actions)/useDashStore';
import { useConfigurationQuery, useOrgQuery,  useArticlesQuery, useSearchArticlesQuery } from '../../(hooks)/queries';
import { CgSpinner } from 'react-icons/cg';
import { Article, ArticleCategory, ArticleSearchRes } from '@/entities/article';
import { EntityItem } from 'electrodb';
import { highlightMatches } from '../../(helpers)/highlightMatches';
import { useDebounce } from "usehooks-ts";

import { ConversationItem, ConversationItemSearchRes } from '@/entities/conversation';
import { ConversationCard } from '../../(chat-widget)/(screens)/(messages)/ConversationCard';
import { ConversationItemSearchKey, conversationItemSearchKey } from 'packages/functions/app/api/src/conversations/search';

type Inputs = {
  phrase: string;
};

const fetchingArticlesSkeleton = (
            <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
              {[...Array(10)].map(() => (
              <div className="flex w-full place-items-center animate-fade-left">
                <div className='flex flex-col w-full gap-y-2'>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"/>
                  <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"/>
                </div>
                <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right"/>
              </div>))}
            </div>
            )




export const ConversationsListView: FC = () => {
  const t = useTranslations('chat-widget');
  const { chatWidget: {setWidgetState, setSelectedArticleId} } = useChatWidgetStore();
  const listConversastions = (categoryArticles: ConversationItem[]) => 
                (<ul className="w-full mb-10 animate-fade-left">
                  <li  className="flex justify-between w-full  h-16 hover:bg-transparent  px-4 font-semibold text-base normal-case  border-0 border-b-[1px] hover:border-b-[1px] hover:border-gray-300 border-gray-300 rounded-none place-items-center text-normal">{t('categories', {count: Object.entries(categoryArticles ?? {}).filter((category) => category.length).length})}</li> 
                    <ConversationCard height='16'></ConversationCard> 
                </ul>)


  const listSearchMatches = (responses: ConversationItemSearchRes[]) => {
                return (
                  <ul className="w-full mb-10 animate-fade-left">
                    {responses?.map((response) => {
                        const matchKeys = response.matches.map((match => match.key))
                        const matches: Record<ConversationItemSearchKey, {indices: [number,number][], key: string, value: string, refIndex?: number} | undefined> = {}
                        const highlightedField: Record<ConversationItemSearchKey, ReactNode[] | undefined> = {}

                        conversationItemSearchKey.map((key) => {
                          matches[key] = response.matches.find((matchedField => matchedField.key === key))
                        })
                        
                        Object.entries(matches).map(([key, value]) => {
                          highlightedField[key] = matchKeys.includes(key) && matches[key]?.indices.length ? highlightMatches(matches[key]?.value,  matches[key]?.indices) : undefined
                        })
                        // const category = matchKeys.includes('category') && categoryIndicies?.length ? highlightMatches(response.item.category, categoryIndicies ) : ''
                        // const subtitle = response.item?.subtitle && contentIndicies && matchKeys.includes('subtitle') ? highlightMatches(response.item?.subtitle, subtitleIndicies) : ''
                        // const content = matchKeys.includes('content') && highlightMatches(response.item.content, contentIndicies)
                        return  (
                          <li key={response.refIndex} onClick={() => setSelectedConversationId(response.item.conversation.conversationId)} className={`flex  justify-between w-full ${highlightedField['conversation.messages']?.length ? 'h-28' : 'h-20'} font-light normal-case border-0 border-b-[1px] border-gray-300 rounded-none btn btn-ghost text-normal`}>
                            <div className='flex flex-col justify-start w-5/6 overflow-y-clip basis-3/4 place-items-start gap-y-1'>
                              <h5 className='justify-start text-base text-start'>{highlightedField['conversation.customer.name'] ? highlightedField['conversation.customer.name'].map(child => (<>{child}</>)) : matches['conversation.customer.name']?.value}</h5> 
                              <h5 className='text-sm'>{highlightedField['conversation.customer.email'] ? highlightedField['conversation.customer.email'].map(child => (<>{child}</>)) : matches['conversation.customer.email']?.value}</h5> 
                              {highlightedField['conversation.messages'] && <p className='justify-start text-xs text-start text-neutral-400'>{highlightedField['conversation.messages'] ? highlightedField['conversation.messages'].map(child => (<>{child}</>)) : matches['conversation.messages']?.value}</p>}
                            </div>
                            <BiChevronRight className="flex text-3xl basis-1/6 shrink-0 justify-right"/>
                          </li>
                          )
                      })
                    }
                  </ul>)
  };

  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const locale = useLocale();
  const [phrase, setPhrase] = useState('');
  const debouncedSearchPhrase = useDebounce(phrase, 150);
  const searchArticlesQuery = useSearchArticlesQuery(orgId, locale, debouncedSearchPhrase) 
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => setPhrase(data.phrase);
  const handleChange: ChangeHandler = async(event) => {
    setPhrase(event?.target?.value as string);
  }
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const org = useOrgQuery(orgId)
  const articles = useArticlesQuery(orgId, locale)

  const categoryArticles: CategoryArticles | undefined  = articles?.data?.reduce((prev, curr) => {
    prev[curr.category] = [...prev?.[curr.category] ?? [], curr];
    return prev
  }, {} as CategoryArticles)

  const noData = (
              <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
                <h5 className='flex font-semibold'>{t('articles', {count: 0})}</h5> 
                <p className='flex text-xs text-neutral-400'>{`${t('No results for')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p>
              </div>
              )

  const renderContent = () => {
    if(articles.isFetching || searchArticlesQuery.isFetching) {
      return fetchingArticlesSkeleton 
    }
    // not searching
    else if (phrase?.length < 3) {
        // if category selected
        if(currentCategory ) {
          return listCategoryArticles(currentCategory, categoryArticles?.[currentCategory] ?? [])
        } else {
          return categoryArticles ? listCategories(categoryArticles) : noData
        }
    }
    // searching
    else {
      console.log(searchArticlesQuery,searchArticlesQuery?.data)
      return searchArticlesQuery?.data?.length ? listSearchMatches(searchArticlesQuery.data ?? []) : noData
    }
  }
    

  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`background text-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold p-3 gap-x-2   `}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data}/>}
          <div className='flex justify-center w-full place-items-center'>
            {currentCategory && <BiChevronLeft onClick={() => setCurrentCategory(null)} role='button' className="absolute text-4xl hover:cursor-pointer left-1 "/>}
            <h5 className=''>{t('Help')}</h5>
          </div>
                      
          <form className="flex w-full text-black bg-white rounded-lg place-items-center join" onSubmit={handleSubmit(onSubmit)}>
            <input  className="justify-between w-full font-normal normal-case bg-white border-0 rounded-lg input-bordered input-sm text-normal"  placeholder='Search for help' {...register("phrase", {onChange: (e) => handleChange(e)})} />
            <div className='rounded-r-lg -ml-7'>
            {searchArticlesQuery.isFetching ? 
            <CgSpinner className="text-2xl animate-spin " />
            : phrase.length > 2 ? <BsX onClick={() => setPhrase('')}/> : <BsSearch className='justify-end text-lg '/>}
            </div>
          </form>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full  overflow-y-scroll mx-2 `}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
