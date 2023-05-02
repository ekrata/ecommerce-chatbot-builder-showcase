'use client';

import { useState, FC } from 'react';
import Image from 'next/image';
import LocaleCode from 'locale-code';
import { MdEmail, MdPhone } from 'react-icons/md';
import { GoBrowser } from 'react-icons/go';
import ct from 'countries-and-timezones';
import { BsGlobe, BsTagsFill } from 'react-icons/bs';
import { flag } from 'country-emoji';
import { FaLanguage } from 'react-icons/fa';
import { HiDocumentText } from 'react-icons/hi2';
import { BiTime } from 'react-icons/bi';
import { useFormatter, useTranslations } from 'next-intl';
import { Chat } from './Chat.type';

type InfoTabs = 'Profile' | 'Visited Pages' | 'Notes';

const visitedPages = 'Visited Pages';
const profile = 'Profile';
const notesTab = 'Notes';

export const ChatInfoPanel: FC<{ chat: Chat }> = ({ chat }) => {
  const [currentTab, setCurrentTab] = useState<InfoTabs>('Profile');
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
      visited,
      notes,
    },
  } = chat;
  const country = ct.getCountryForTimezone(timezone);
  const tabActive = 'tab-active';
  const t = useTranslations('app.inbox.chat');
  const { relativeTime } = useFormatter();
  return (
    <div
      data-testid='chat-info-panel'
      className='flex flex-col gap-y-2 bg-white dark:bg-gray-800 w-full border-l-2 border-primary p-4 h-screen'
    >
      <div className='flex gap-x-2 '>
        <Image
          src={profilePicture}
          alt='User image'
          width={80}
          height={80}
          className='rounded-full object-contain'
        />
        <div className='flex flex-col'>
          <p>{name ?? 'Unknown'}</p>
          <p>{email}</p>
          <p>{LocaleCode.getLanguageName(locale)}</p>
        </div>
      </div>
      <div>
        <div className='tabs w-full justify-items-stretch m-0'>
          <button
            type='button'
            data-testid='profile-button'
            className={`tab tab-bordered w-1/3 ${
              currentTab === profile && tabActive
            }`}
            onClick={() => setCurrentTab(profile)}
          >
            {t('profile')}
          </button>
          <button
            type='button'
            data-testid='visited-pages-button'
            className={`tab tab-bordered w-1/3 ${
              currentTab === visitedPages && tabActive
            }`}
            onClick={() => setCurrentTab(visitedPages)}
          >
            {t('visited-pages')}
          </button>
          <button
            type='button'
            data-testid='notes-button'
            className={`tab tab-bordered w-1/3 ${
              currentTab === notesTab && tabActive
            }`}
            onClick={() => setCurrentTab(notesTab)}
          >
            {t('notes')}
          </button>
        </div>
        {currentTab === 'Profile' && (
          <div className=' shadow-lg p-4 my-6'>
            <ul className='space-y-4'>
              <li className='flex place-items-center justify-start gap-x-4'>
                <MdEmail className='text-primary text-lg' />
                <p>{email}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <MdPhone className='text-primary text-lg' />
                <p>{phone ?? 'Phone...'}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <GoBrowser className='text-primary text-lg' />
                <p>{userAgent ?? ''}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <BsGlobe className='text-primary text-lg' />
                <p className='flex text-xl'>{flag(country.name)}</p>
                <p>{country.name}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <BiTime className='text-primary text-xl' />
                <p>
                  {timezone
                    ? `${new Date().toLocaleString(locale, {
                        timeZone: timezone,
                      })} ${timezone}`
                    : 'Phone...'}
                </p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <FaLanguage className='text-primary text-lg' />
                <p className=''>{LocaleCode.getLanguageName(locale)}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <HiDocumentText className='text-primary text-lg' />
                <p className=''>{JSON.stringify(properties)}</p>
              </li>
              <li className='flex place-items-center justify-start gap-x-4'>
                <BsTagsFill className='text-primary text-lg' />
                <p className=''>{tags?.join(', ')}</p>
              </li>
            </ul>
          </div>
        )}
        {currentTab === visitedPages && (
          <div className=' shadow-lg p-4 my-6'>
            <ul className='space-y-4'>
              {Object.entries(visited)
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
          <div className=' shadow-lg p-4 my-6'>
            <textarea
              className='textarea textarea-primary w-full h-screen'
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
