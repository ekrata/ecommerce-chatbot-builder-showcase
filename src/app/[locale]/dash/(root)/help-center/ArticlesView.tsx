'use client'

import { EntityItem } from 'electrodb';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { ChangeHandler, SubmitHandler, useForm } from 'react-hook-form';
import { BiChevronLeft, BiChevronRight, BiSend } from 'react-icons/bi';
import { BsPlus, BsSearch, BsX } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { useDebounce } from 'usehooks-ts';

import { Article, ArticleCategory, ArticleSearchRes } from '@/entities/article';
import { DynamicBackground } from '@/src/app/[locale]/(helpers)/DynamicBackground';
import { highlightMatches } from '@/src/app/[locale]/(helpers)/highlightMatches';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { useArticlesQuery } from '@/src/app/[locale]/(hooks)/queries/useArticlesQuery';
import { useConfigurationQuery } from '@/src/app/[locale]/(hooks)/queries/useConfigurationQuery';

import { useSearchArticlesQuery } from '../../../(hooks)/queries/useSearchArticlesQuery';

type Inputs = {
  phrase: string;
};

const fetchingArticlesSkeleton = (
  <div className="flex flex-col w-full h-screen p-2 my-2 bg-white nanimate-pulse gap-y-2">
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

export type CategoryArticles = { [key in ArticleCategory]: EntityItem<typeof Article>[] | undefined }



export const ArticlesView: FC = () => {
  const t = useTranslations('chat-widget');
  const tDash = useTranslations('dash')
  const listCategories = (categoryArticles: CategoryArticles) =>
  (<ul className="w-full mb-10 animate-fade-left">
    <li className="flex justify-between w-full  h-16 hover:bg-transparent  px-4 font-semibold text-base normal-case  border-0 border-b-[1px] hover:border-b-[1px] hover:border-gray-300 border-gray-300 rounded-none place-items-center text-normal">{t('categories', { count: Object.entries(categoryArticles ?? {}).filter((category) => category.length).length })}</li>
    {Object.entries(categoryArticles ?? {})?.map(([category, articles]) => {
      return (
        <li key={category} onClick={() => setCurrentCategory(category as ArticleCategory)} className="flex justify-between w-full h-16 font-light normal-case border-0 border-b-[1px] border-gray-300 rounded-none btn btn-ghost text-normal">
          <div className='flex flex-col place-items-start gap-y-1 basis-5/6'>
            <h5 className='flex font-semibold text-start'>{category}</h5>
            <p className='flex text-xs text-neutral-400 text-start'>{t('articles', { count: articles?.length })}</p>
          </div>
          <BiChevronRight className="text-3xl justify-right basis-1/6" />
        </li>)
    })
    }
  </ul>)

  const listCategoryArticles = (category: string, articles: EntityItem<typeof Article>[]) =>
  (<ul className="w-full mb-10 animate-fade-left">
    <li key={category} className="flex justify-between place-items-center w-full h-16 px-4 font-light normal-case border-0 border-b-[1px] hover:border-b-[1px] hover:border-gray-300 border-gray-300 rounded-none text-normal">
      <div className='flex flex-col place-items-start '>
        <h5 className='flex font-semibold'>{category}</h5>
        <p className='flex text-xs text-neutral-400'>{t('articles', { count: articles.length })}</p>

      </div>
    </li>
    {articles?.map((article) => {
      return (<Link key={article.title} href={{ pathname: `help-center/`, query: { articleId: article.articleId } }}>
        <li className="flex justify-between w-full h-16 font-light normal-case border-0 border-b-[1px] border-gray-300 rounded-none btn btn-ghost text-normal">
          <div className='flex flex-col justify-start place-items-start basis-5/6 gap-y-1'>
            <h5 className='font-semibold text-start'>{article.title}</h5>
            {article?.subtitle && <p className='text-xs text-neutral-400'>{article?.subtitle}</p>}
          </div>
          <BiChevronRight className="text-3xl justify-right basis-1/6" />
        </li>
      </Link>)
    })
    }
  </ul >)

  const listSearchMatches = (responses: ArticleSearchRes[]) => {
    return (
      <ul className="w-full mb-10 animate-fade-left">
        {responses?.map((response) => {
          const matchKeys = response.matches.map((match => match.key))
          const titleIndicies = response.matches.find((matchedField => matchedField.key === 'title'))?.indices
          const categoryIndicies = response.matches.find((matchedField => matchedField.key === 'category'))?.indices
          const subtitleIndicies = response.matches.find((matchedField => matchedField.key === 'subtitle'))?.indices
          const contentIndicies = response.matches.find((matchedField => matchedField.key === 'content'))?.indices
          const title = matchKeys.includes('title') && titleIndicies?.length ? highlightMatches(response.item.title, titleIndicies) : ''
          const category = matchKeys.includes('category') && categoryIndicies?.length ? highlightMatches(response.item.category, categoryIndicies) : ''
          const subtitle = response.item?.subtitle && contentIndicies && matchKeys.includes('subtitle') ? highlightMatches(response.item?.subtitle, subtitleIndicies) : ''
          const content = matchKeys.includes('content') && highlightMatches(response.item.content, contentIndicies)
          return (
            <Link key={response.refIndex} href={{ pathname: `help-center/`, query: { articleId: response?.item?.articleId } }}>
              <li className={`flex  justify-between w-full ${content && content?.length ? 'h-28' : 'h-20'} font-light normal-case border-0 border-b-[1px] border-gray-300 rounded-none btn btn-ghost text-normal`}>
                <div className='flex flex-col justify-start w-5/6 overflow-y-clip basis-3/4 place-items-start gap-y-1'>
                  <h5 className='justify-start text-base text-start'>{title.length ? title : response.item.title}</h5>
                  <h5 className='text-sm'>{category.length ? category : response.item.category}</h5>
                  {/* <p className='text-sm text-neutral-400'>{subtitle.length ? subtitle : response.item?.subtitle}</p> */}
                  {content && <p className='justify-start text-xs text-start text-neutral-400'>{content.map((child) => (<>{child}</>))}</p>}
                </div>
                <BiChevronRight className="flex text-3xl basis-1/6 shrink-0 justify-right" />
              </li>
            </Link>
          )
        })
        }
      </ul>)
  };

  const locale = useLocale();
  const [phrase, setPhrase] = useState('');
  const debouncedSearchPhrase = useDebounce(phrase, 150);
  const [operatorSession] = useAuthContext()
  const orgId = operatorSession?.orgId ?? ''
  const searchArticlesQuery = useSearchArticlesQuery([orgId, locale, debouncedSearchPhrase])
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => setPhrase(data.phrase);
  const handleChange: ChangeHandler = async (event) => {
    setPhrase(event?.target?.value as string);
  }

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const articles = useArticlesQuery([orgId, locale])

  console.log(articles)
  const categoryArticles: CategoryArticles | undefined = articles?.data?.reduce((prev, curr) => {
    prev[curr.category] = [...prev?.[curr.category] ?? [], curr];
    return prev
  }, {} as CategoryArticles)

  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'>{t('articles', { count: 0 })}</h5>
      <p className='flex text-xs text-neutral-400'>{`${t('No results for')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p>
    </div>
  )

  const renderContent = () => {
    if (articles.isFetching || searchArticlesQuery.isFetching) {
      return fetchingArticlesSkeleton
    }
    // not searching
    else if (phrase?.length < 3) {
      // if category selected
      if (currentCategory) {
        return listCategoryArticles(currentCategory, categoryArticles?.[currentCategory] ?? [])
      } else {
        return categoryArticles ? listCategories(categoryArticles) : noData
      }
    }
    // searching
    else {
      console.log(searchArticlesQuery, searchArticlesQuery?.data)
      return searchArticlesQuery?.data?.length ? listSearchMatches(searchArticlesQuery.data ?? []) : noData
    }
  }


  return (
    <div className="flex justify-between w-full h-full bg-white ">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center  text-xl font-semibold p-3 gap-x-2   `}
        >
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <div className='flex justify-between w-full place-items-center'>
            {currentCategory && <BiChevronLeft onClick={() => setCurrentCategory(null)} role='button' className="justify-start text-3xl text-black hover:cursor-pointer left-1 " />}
            <h5 className='justify-center'>{t('Help')}</h5>
            <Link href={{ pathname: '', query: { articleId: 'new' } }} className='max-w-xs normal-case btn-outline gap-x-2 btn btn-sm '><BsPlus className='text-2xl' />{tDash('New Article')}</Link>
          </div>

          {/* <form className="flex w-full text-black bg-gray-200 rounded-md place-items-center join" onSubmit={handleSubmit(onSubmit)}>
            <input className="justify-between w-full font-normal normal-case bg-gray-200 border-0 rounded-md input-bordered input-sm text-normal" placeholder='Search for help' {...register("phrase", { onChange: (e) => handleChange(e) })} />
            <div className='rounded-r-lg -ml-7'>
              {searchArticlesQuery.isFetching ?
                <CgSpinner className="text-2xl animate-spin " />
                : phrase.length > 2 ? <BsX onClick={() => setPhrase('')} /> : <BsSearch className='justify-end text-lg ' />}
            </div>
          </form> */}
        </div>
        <div
          className={`flex flex-col bg-white place-items-center  w-full  overflow-y-scroll mx-2 `}
        >
          {renderContent()}
        </div>
      </div>
    </div >
  );
};
