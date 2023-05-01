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
import { Chat } from './Chat.type';

type InfoTabs = 'Profile' | 'Viewed Pages' | 'Notes';

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
    },
  } = chat;
  const country = ct.getCountryForTimezone(timezone);
  const tabActive = 'tab-active';
  return (
    <div
      data-testid='chat-info-panel'
      className='flex flex-col gap-y-2 bg-white dark:bg-gray-800 w-full border-l-2 border-primary px-2'
    >
      <div className='flex gap-x-2 '>
        <Image
          src={profilePicture}
          alt='User image'
          width={60}
          height={60}
          className='rounded-full '
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
            className={`tab tab-bordered w-1/3 ${
              currentTab === 'Profile' && tabActive
            }`}
            onClick={() => setCurrentTab('Profile')}
          >
            Profile
          </button>
          <button
            type='button'
            className={`tab tab-bordered w-1/3 ${
              currentTab === 'Viewed Pages' && tabActive
            }`}
            onClick={() => setCurrentTab('Viewed Pages')}
          >
            Viewed Pages
          </button>
          <button
            type='button'
            className={`tab tab-bordered w-1/3 ${
              currentTab === 'Notes' && tabActive
            }`}
            onClick={() => setCurrentTab('Notes')}
          >
            Notes
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
                <p className='text-lg'>
                  {timezone ? `${flag(country.name)} ${timezone}` : 'Phone...'}
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
      </div>
    </div>
  );
};
