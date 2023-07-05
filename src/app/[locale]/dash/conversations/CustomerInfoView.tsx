'use client';

import ct from 'countries-and-timezones';
import { flag } from 'country-emoji';
import LocaleCode from 'locale-code';
import { useFormatter, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC, useState } from 'react';
import { BiChevronRight, BiTime } from 'react-icons/bi';
import { BsChat, BsGlobe, BsPerson, BsTagsFill } from 'react-icons/bs';
import { FaLanguage } from 'react-icons/fa';
import { GoBrowser } from 'react-icons/go';
import { HiDocumentText } from 'react-icons/hi2';
import { MdEmail, MdPhone } from 'react-icons/md';

import { ConversationItem } from '@/entities/conversation';

import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';

type InfoTabs = 'Profile' | 'Visited Pages' | 'Notes';

const visitedPagesTabLabel = 'Visited Pages';
const profile = 'Profile';
const notesTab = 'Notes';

const fetchingSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
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
  const [currentTab, setCurrentTab] = useState<InfoTabs>('Profile');
  const operatorSession = useOperatorSession();
  const { orgId } = operatorSession
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId')
  const conversationItemQuery = useConversationItemQuery(orgId, conversationId ?? '')
  const conversationItem = conversationItemQuery.data
  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
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
    customer: {
      profilePicture,
      name,
      email,
      locale,
      phone,
      userAgent,
      timezone,
      tags,
      properties,
      visitedPages,
      notes,
    },
  } = conversationItem?.conversation;
  const country = ct.getCountryForTimezone(timezone ?? '');
  const tabActive = 'tab-active';
  const { relativeTime } = useFormatter();
  return (
    <div
      data-testid='chat-info-panel'
      className='flex flex-col w-full h-screen p-4 bg-white border-l-2 gap-y-2 dark:bg-gray-800 border-primary'
    >
      <div className='flex gap-x-2 '>
        {profilePicture ? <Image
          src={profilePicture}
          alt='User image'
          width={80}
          height={80}
          className='object-contain rounded-full'
        /> : <BsPerson className='w-80' />}
        <div className='flex flex-col'>
          <p>{name ?? 'Unknown'}</p>
          <p>{email}</p>
          <p>{LocaleCode.getLanguageName(locale)}</p>
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
            className={`tab tab-bordered w-1/3 ${currentTab === visitedPages && tabActive
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
          <div className='p-4 my-6 shadow-lg '>
            <ul className='space-y-4'>
              <li className='flex justify-start place-items-center gap-x-4'>
                <MdEmail className='text-lg text-primary' />
                <p>{email}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <MdPhone className='text-lg text-primary' />
                <p>{phone ?? 'Phone...'}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <GoBrowser className='text-lg text-primary' />
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
                    })} ${timezone}`
                    : 'Phone...'}
                </p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <FaLanguage className='text-lg text-primary' />
                <p className=''>{LocaleCode.getLanguageName(locale)}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <HiDocumentText className='text-lg text-primary' />
                <p className=''>{JSON.stringify(properties)}</p>
              </li>
              <li className='flex justify-start place-items-center gap-x-4'>
                <BsTagsFill className='text-lg text-primary' />
                <p className=''>{tags?.join(', ')}</p>
              </li>
            </ul>
          </div>
        )}
        {currentTab === visitedPages && (
          <div className='p-4 my-6 shadow-lg '>
            <ul className='space-y-4'>
              {Object.entries(visitedPages)
                .reverse()
                ?.map(([key, link]) => (
                  <li className='flex gap-x-2'>
                    <p className='text-subtitle'>
                      {relativeTime(new Date(parseInt(key, 10)), new Date())}
                    </p>
                    <a className='link link-primary'>{link}</a>
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
