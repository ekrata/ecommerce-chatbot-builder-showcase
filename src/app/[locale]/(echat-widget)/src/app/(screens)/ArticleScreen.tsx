import { EntityItem } from 'electrodb';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { FC, useRef } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { useIntersectionObserver } from 'usehooks-ts';

import { useQuery } from '@tanstack/react-query';

import { getArticleWithContent } from '../(actions)/orgs/articles/getArticleWithContent';
import { useChatWidgetStore } from '../(actions)/useChatWidgetStore';
import { DynamicBackground } from '../../../../(helpers)/DynamicBackground';
import { useConfigurationQuery } from '../../../../(hooks)/queries';
import { Article, ArticleCategory } from '../../../../../../../stacks/entities/article';
import { Configuration } from '../../../../../../../stacks/entities/configuration';

const fetchingArticleSkeleton = (
  <div className="flex-col w-screen h-screen p-2 my-2 animate-pulse rounded-3xl gap-y-2">
    {[...Array(6)].map(() => (
      <div className="flex flex-col justify-start w-full animate-fade-left ">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700  w-full mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700  w-full mb-2.5"></div>
        <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 "></div>
      </div>))}
  </div>
)

export type CategoryArticles = { [key in ArticleCategory]: EntityItem<typeof Article>[] | undefined }



export const ArticleScreen: FC = () => {
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const locale = useLocale();
  const { relativeTime } = useFormatter();
  const { chatWidget: { setWidgetState, selectedArticleId, setSelectedArticleId } } = useChatWidgetStore();
  const articleWithContentQuery = useQuery([orgId, locale, selectedArticleId], async () => getArticleWithContent(orgId, locale, selectedArticleId ?? ''), { enabled: !!(!!orgId && !!locale && selectedArticleId) })

  const ref = useRef<HTMLHeadingElement | null>(null)
  const entry = useIntersectionObserver(ref, {})
  const headerHidden = !!!entry?.isIntersecting

  const configuration = useConfigurationQuery(orgId);

  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'>{t('articles', { count: 0 })}</h5>
    </div>
  )


  console.log(articleWithContentQuery?.data)
  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-transparent flex h-full flex-col place-items-center animated-flip-down w-full justify-center text-xl    `}
        >
          {articleWithContentQuery.isFetching ? fetchingArticleSkeleton : (
            <>
              <div className={`background text-white flex sticky animate-fade-down place-items-center border-b-[1px] border-gray-300 shadow-[0px_20px_40px_20px_#FFF]  ': ''} w-full h-16`}>
                {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
                <BiChevronLeft onClick={() => setSelectedArticleId()} role='button' className="justify-start text-3xl absoluteleft-0 hover:cursor-pointer place-items-center " />
                {/* If article title is not visible, create navbar */}
                {/* {headerHidden && <h4 className='text-sm text-start'>{articleWithContentQuery?.data?.title}</h4>} */}
                <h4 className='text-base text-start'>{articleWithContentQuery?.data?.title}</h4>
              </div>
              {articleWithContentQuery?.data ? (
                <>
                  <div className='justify-start w-full h-screen px-1 overflow-y-scroll prose place-items-start gap-y-1'>
                    <h4 ref={ref} className='justify-start mt-10 text-base text-start'>{articleWithContentQuery?.data?.title}</h4>
                    {/* <p className='text-sm'>{articleWithContentQuery?.data?.category}</p>  */}
                    <p className='justify-start mb-4 text-sm text-start text-neutral-400'>{articleWithContentQuery?.data?.subtitle ?? articleWithContentQuery?.data?.category}</p>
                    <p className='text-xs text-neutral-500'>{t('Updated')} {relativeTime(articleWithContentQuery?.data?.updatedAt ?? Date.now(), Date.now())}.</p>
                    <div className='mb-6'>
                      {articleWithContentQuery?.data?.articleContent?.content}
                    </div>
                  </div>
                </>
              ) : noData}
            </>)}
        </div>
      </div>
    </div>
  );
};
