'use client';

import ct from 'countries-and-timezones';
import { flag } from 'country-emoji';
import LocaleCode from 'locale-code';
import { useFormatter, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BiChevronLeft, BiChevronRight, BiTime } from 'react-icons/bi';
import { BsChat, BsGlobe, BsPerson, BsTagsFill } from 'react-icons/bs';
import { FaLanguage } from 'react-icons/fa';
import { GoBrowser } from 'react-icons/go';
import { HiDocumentText } from 'react-icons/hi2';
import { MdEmail, MdPhone } from 'react-icons/md';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useConversationItemQuery } from '../../../(hooks)/queries/useConversationItemQuery';
import { useConversationItemsQuery } from '../../../(hooks)/queries/useConversationItemsQuery';
import { useVisitsQuery } from '../../../(hooks)/queries/useVisitsQuery';
import { CustomerAvatar } from './CustomerAvatar';

type InfoTabs = 'Profile' | 'Visited Pages' | 'Notes';

const visitedPagesTabLabel = 'Visited Pages';
const profile = 'Profile';
const notesTab = 'Notes';

const fetchingSkeleton = (
  <div className="flex flex-col w-full h-screen p-2 bg-white animate-pulse gap-y-2">
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



export const CustomerInfoView: FC = () => {
  const t = useTranslations('app.inbox.chat');
  const tDash = useTranslations('dash');
  const { relativeTime } = useFormatter();
  const [currentTab, setCurrentTab] = useState<InfoTabs>('Profile');
  const { conversationState, setConversationState, conversationListFilter, } = useDashStore();
  const [operatorSession] = useAuthContext();
  const orgId = operatorSession?.orgId ?? ''
  const searchParams = useSearchParams()
  const conversationId = searchParams?.get('conversationId')

  const conversationItemQuery = useConversationItemsQuery(conversationListFilter)
  const conversationItem = conversationItemQuery?.data?.pages?.flatMap(data => data.data).find(conversation => conversation.conversationId === conversationId)
  const visitsQuery = useVisitsQuery(orgId, conversationItem?.customerId)
  const noData = (
    <div className='flex flex-col justify-center w-full h-screen bg-white place-items-center gap-y-1'>
      <h5 className='flex font-semibold'><BsChat />{tDash('conversations', { count: 0 })}</h5>
      {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
    </div>
  )
  if (conversationItemQuery.isFetching) {
    return fetchingSkeleton
  }
  if (!conversationItem) {
    return noData
  }
  const {
    profilePicture,
    name,
    email,
    locale,
    phone,
    userAgent,
    timezone,
    tags,
    properties,
    notes,
  } = conversationItem?.customer
  const country = ct.getCountryForTimezone(timezone ?? '');
  const tabActive = 'tab-active';
  return (
    <div
      data-testid='chat-info-panel'
      className='flex flex-col w-full h-screen max-h-screen p-4 bg-white gap-y-2 dark:bg-gray-800 '
    >
      <div className='flex gap-x-2 place-item-center'>
        {isMobile &&
          <BiChevronLeft className='text-4xl' onClick={() => setConversationState()}></BiChevronLeft>
        }
        <div className='flex place-items-center'>
          <CustomerAvatar conversationItem={conversationItem}></CustomerAvatar>
        </div>
        <div className='flex flex-col'>
          <p>{name ?? ''}</p>
          <p>{email}</p>
          <p className='flex place-items-center gap-x-2'><FaLanguage className='text-xl' />{LocaleCode.getLanguageName(locale)}</p>
        </div>
      </div>
      <div>
        <div className='w-full m-0 tabs justify-items-stretch'>
          <button
            type='button'
            data-testid='profile-button'
            className={`tab tab-bordered w-1/3 ${currentTab === profile && tabActive
              }`}
            onClick={() => setCurrentTab(profile)}
          >
            {t('profile')}
          </button>
          <button
            type='button'
            data-testid='visited-pages-button'
            className={`tab tab-bordered w-1/3 ${currentTab === 'Visited Pages' && tabActive
              }`}
            onClick={() => setCurrentTab(visitedPagesTabLabel)}
          >
            {t('visited-pages')}
          </button>
          <button
            type='button'
            data-testid='notes-button'
            className={`tab tab-bordered w-1/3 ${currentTab === notesTab && tabActive
              }`}
            onClick={() => setCurrentTab(notesTab)}
          >
            {t('notes')}
          </button>
        </div>
        {currentTab === 'Profile' && (
          <div className='my-6 '>
            <ul className='space-y-4'>
              <li className='flex justify-start place-items-center gap-x-4'>
                <MdEmail className='text-lg text-primary' />
                <p>{email ?? ''}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <MdPhone className='text-lg text-primary' />
                <p>{phone ?? 'Phone...'}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <GoBrowser className='text-6xl text-primary' />
                <p>{userAgent ?? ''}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <BsGlobe className='text-lg text-primary' />
                <p className='flex text-xl'>{flag(country?.name ?? '')}</p>
                <p>{country?.name}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <BiTime className='text-xl text-primary' />
                <p>
                  {timezone
                    ? `${new Date().toLocaleString(locale, {
                      timeZone: timezone,
                    })}${timezone}`
                    : ''}
                </p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <FaLanguage className='text-lg text-primary' />
                <p className=''>{LocaleCode.getLanguageName(locale)}</p>
              </li>
              {/* <li className='flex justify-start place-items-center gap-x-4'>
                <HiDocumentText className='text-lg text-primary' />
                <p className=''>{JSON.stringify(properties)}</p>
              </li> */}
              {/* <li className='flex justify-start place-items-center gap-x-4'>
                <BsTagsFill className='text-lg text-primary' />
                <p className=''>{tags?.join(', ')}</p>
              </li> */}
            </ul>
          </div>
        )}
        {currentTab === 'Visited Pages' && (
          <div className='p-4 my-6 shadow-lg '>
            <ul className='space-y-4'>
              {visitsQuery?.data?.data
                ?.map((item) => (
                  <li className='flex gap-x-2'>
                    <p className='text-subtitle'>
                      {relativeTime(new Date(item.at), new Date())}
                    </p>
                    <a className='link link-primary'>{item.url}</a>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {currentTab === notes && (
          <div className='p-4 my-6 shadow-lg '>
            <textarea
              className='w-full h-screen textarea textarea-primary'
              placeholder={t('notes-placeholder')}
            >
              {notes}
            </textarea>
          </div>
        )}
      </div>
    </div>
  );
};
