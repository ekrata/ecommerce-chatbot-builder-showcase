'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { BiHelpCircle } from 'react-icons/bi';
import { BsRobot } from 'react-icons/bs';
import { CgWebsite } from 'react-icons/cg';
import { IoMdChatboxes } from 'react-icons/io';
import { MdOutlineDashboard } from 'react-icons/md';
import { TbSettings } from 'react-icons/tb';

export default function DashNavbar() {
  const locale = useLocale()
  const t = useTranslations('app.layout');
  // const conversation = useConversationItemsQuery({ ...conversationFilter })
  const unreadMessages = 5;

  return (
    <ul className='flex flex-col text-gray-400 normal-case bg-black place-items-center hover:bg-opacity-0'>
      <li>
        <Link
          href="/dash"
          key='home'
          className='flex btn btn-ghost'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('home')}>
            <MdOutlineDashboard className='w-6 h-6' />
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/conversations" }}
          key='conversations'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('conversations')}>
            <div className='indicator'>
              <span className='text-xs indicator-item badge badge-primary'>
                {unreadMessages}
              </span>
              <IoMdChatboxes className='w-6 h-6' />
            </div>
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/visitors" }}
          key='visitors'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('visitors')}>
            <div className='indicator'>
              <span className='text-xs indicator-item badge badge-primary'>
                {/* {newVisits} */}
              </span>
              <CgWebsite className='w-6 h-6' />
            </div>
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/bots" }}
          key='bots'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('bots')}>
            <div className='indicator'>
              <span className='text-xs indicator-item badge badge-primary'>
                {/* {newVisits} */}
              </span>
              <BsRobot className='w-6 h-6' />
            </div>
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/help-center" }}
          key='visitors'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('help-center')}>
            <BiHelpCircle className='w-6 h-6 text-gray-400' />
          </div>
        </Link>
      </li>
      <li className='justify-end'>
        <Link
          href={{ pathname: "/dash/settings" }}
          key='settings'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('settings')}>
            <TbSettings className='w-6 h-6 text-gray-400' />
          </div>
        </Link>
      </li>
    </ul >
  );
}
