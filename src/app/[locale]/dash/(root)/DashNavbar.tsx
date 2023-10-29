'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { BiHelpCircle } from 'react-icons/bi';
import { BsFillPeopleFill, BsRobot } from 'react-icons/bs';
import { CgWebsite } from 'react-icons/cg';
import { IoMdChatboxes } from 'react-icons/io';
import { MdOutlineDashboard } from 'react-icons/md';
import { PiBrowsersFill } from 'react-icons/pi';
import { TbSettings } from 'react-icons/tb';

import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { useConversationItemsQuery } from '../../(hooks)/queries/useConversationItemsQuery';
import { useDashStore } from './(actions)/useDashStore';

export default function DashNavbar() {
  const locale = useLocale()
  const { conversationListFilter } = useDashStore()
  const t = useTranslations('app.layout');

  const unreadMessages = useConversationItemsQuery(conversationListFilter)?.data?.pages?.[0]?.data.reduce((prev, curr) => {
    if (!curr?.read) {
      return prev + 1
    }
    return prev
  }, 0)

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

              {unreadMessages &&
                <span className='text-xs indicator-item badge badge-info'>
                  {unreadMessages}
                </span>

              }
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
              {/* <span className='text-xs indicator-item badge badge-info'>
                0
              </span> */}
              <BsFillPeopleFill className='w-6 h-6' />
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
              {/* <span className='text-xs indicator-item badge badge-info'>
                0
              </span> */}
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
      <li >
        <Link
          href={{ pathname: "/dash/sandbox" }}
          key='sandbox'
          passHref
          legacyBehavior
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          {/* <a target="_blank" rel="noopener noreferrer"> */}
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('sandbox')}>
            <PiBrowsersFill className='w-6 h-6 text-gray-400' />
          </div>
          {/* </a> */}
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
