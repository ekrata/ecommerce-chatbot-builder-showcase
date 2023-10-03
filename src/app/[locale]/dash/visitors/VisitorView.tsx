'use client';

import ct from 'countries-and-timezones';
import { flag } from 'country-emoji';
import { useFormatter, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { FcAlarmClock, FcClock, FcGlobe } from 'react-icons/fc';
import { v4 as uuidv4 } from 'uuid';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useCreateConversationMut } from '../../(hooks)/mutations/useCreateConversationMut';
import { useVisitsQuery } from '../../(hooks)/queries/useVisitsQuery';
import { CustomerAvatar } from '../conversations/CustomerAvatar';
import { PageCursor, Pagination } from '../Pagination';

type InfoTabs = 'Profile' | 'Visited Pages' | 'Notes';

const visitedPagesTabLabel = 'Visited Pages';
const profile = 'Profile';
const notesTab = 'Notes';

const fetchingSkeleton = (
  [...Array(10)].map(() => (
    <tr className='text-xs font-normal truncate animate-pulse'>
      <th >
        <div className='flex gap-x-2 place-items-center'>
          <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
          </svg>
          <div className='flex flex-col justify-start text-xs font-medium gap-y-1'>
            <p>
              <div className="h-2.5  bg-gray-200 rounded-full dark:bg-gray-700 w-24"></div>
            </p>
            <p className='font-normal text-gray-400'>
              <div className="h-2.5  bg-gray-300 rounded-full dark:bg-gray-600 w-32"></div>
            </p>
          </div>
        </div>
      </th >
      <td >
        <div className='flex flex-row'>
          <div className="h-2.5  bg-gray-200 rounded-full dark:bg-gray-700 w-24"></div>
          <div className="h-2.5  bg-gray-300 rounded-full dark:bg-gray-600 w-32"></div>
        </div>
      </td>
      <td >
        <div className='flex flex-row'>
          <div className="h-2.5  bg-gray-200  dark:bg-gray-700 w-6"></div>
          <div className="h-2.5  bg-gray-300  rounded-full dark:bg-gray-600 w-20"></div>
        </div>
      </td>
      <td className=''>
        <div className="h-2.5  bg-gray-200  rounded-full dark:bg-gray-600 w-20"></div>
      </td>
      <td>
      </td>
    </tr >
  ))
)


export const VisitorView: FC = () => {
  const t = useTranslations('dash');
  const { conversationState, setConversationState } = useDashStore();
  const [page, setPage] = useState<number>(1);
  const [pageCursor, setPageCursor] = useState<PageCursor>({ 1: undefined });

  const { relativeTime } = useFormatter();
  const [operatorSession] = useAuthContext();
  const orgId = operatorSession?.orgId ?? ''
  const visitsQuery = useVisitsQuery(orgId);
  const searchParams = useSearchParams();
  const createConversationMut = useCreateConversationMut(orgId)

  useEffect(() => {
    const tempPageCursor = { ...pageCursor }
    tempPageCursor[page] = visitsQuery.data?.cursor
    setPageCursor(tempPageCursor)
  }, [visitsQuery.data?.cursor])

  const handleStartChat = async (customerId: string) => {
    const conversationId = uuidv4()
    await createConversationMut.mutateAsync([orgId ?? '', conversationId, { orgId, operatorId: operatorSession?.operatorId, customerId, channel: 'website', status: 'open' }])
    router.push(`/conversations?conversationId=${conversationId}`)
  }

  return (
    <div className="flex justify-between w-full h-screen shadow-2xl rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={` bg-white flex  normal-case border-b-[1px] flex-col  place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold gap-x-2   `}
        >
          <div className="w-full overflow-x-auto">
            <table className={`table ${isMobile ? 'table-xs' : 'w-full h-screen'}`}>
              {/* head */}
              <thead className='normal-case bg-white '>
                <tr className='normal-case bg-white '>
                  <th className='normal-case bg-transparent'>{t('Name')}</th>
                  <th className='normal-case bg-transparent' >{t('Entered')}</th>
                  <th className='text-2xl normal-case bg-transparent'><FcGlobe /></th>
                  <th className='text-2xl normal-case bg-transparent '><FcClock /></th>
                  <th className='text-2xl normal-case bg-transparent '></th>
                </tr>
              </thead>
              <tbody className='content-start align-top max-h-10'>
                {visitsQuery.isFetching ? fetchingSkeleton :
                  visitsQuery?.data?.data?.map((visit) => (
                    <tr className='content-start w-full text-xs font-normal normal-case truncate max-h-20 hover:cursor-pointer' onClick={() => {
                      handleStartChat(visit.customer.customerId)
                    }}>
                      <th className='bg-transparent'>
                        <div className='flex gap-x-2'>
                          <CustomerAvatar></CustomerAvatar>
                          <div className='flex flex-col text-xs font-medium max-w-20'>
                            <p>
                              {visit.customer.name ?? visit.customer?.email}
                            </p>
                            <p className='font-normal text-gray-400'>
                              {visit.customer.customerId}
                            </p>
                          </div>
                        </div>
                      </th>
                      <td className='bg-transparent'>
                        <a className='link' href={visit.url}>{`/${visit.url.split('/')[3]} `}</a>
                      </td>
                      <td className='text-3xl bg-transparent'>
                        {flag(ct.getCountryForTimezone(visit.customer.timezone ?? '')?.name ?? '')}
                        <p>
                          {/* {visit.customer.timezone
                            ? `${new Date().toLocaleString(visit.customer.locale, {
                              timeZone: visit.customer.timezone,
                            })}${visit.customer.timezone}`
                            : ''} */}
                        </p>
                      </td>
                      <td className='bg-transparent'>
                        {relativeTime(new Date(visit?.at ?? 0), new Date())}

                      </td>
                      <td className='bg-transparent'>
                        <button className='normal-case btn btn-outline btn-xs'>{t('Start chat')}</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

          </div>
        </div>
        <div className='fixed bottom-0'>
          <Pagination pageState={[page, setPage]} />
        </div>

      </div >
    </div >
  )
}