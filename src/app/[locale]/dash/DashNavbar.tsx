'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { IoMdChatboxes } from 'react-icons/io';
import { MdOutlineDashboard } from 'react-icons/md';

export default function DashNavbar() {
  const locale = useLocale()
  const t = useTranslations('app.layout');
  const unreadMessages = 5;

  return (
    <ul className='left-0 flex flex-col text-gray-500 bg-black'>
      <li>
        <Link
          href="/dash"
          key='home'
          className='flex btn btn-ghost'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('home')}>
            <MdOutlineDashboard className='w-6 h-6' />
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/conversations" }}
          key='conversations'
          className='flex btn btn-ghost'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('inbox')}>
            <div className='indicator'>
              <span className='text-xs indicator-item badge badge-primary'>
                {unreadMessages}
              </span>
              <IoMdChatboxes className='w-6 h-6' />
            </div>
          </div>
        </Link>
      </li>
    </ul>
  );
}
