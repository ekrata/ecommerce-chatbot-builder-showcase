import { IconButton, Tooltip } from '@/app/mt-components';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { InboxArrowDownIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { RiDashboardLine } from 'react-icons/ri';

export default function Page({ children }: PropsWithChildren) {
  const t = useTranslations('app.layout');

  return (
    <>
      <IconButton
        data-drawer-target='separator-sidebar'
        data-drawer-toggle='separator-sidebar'
        aria-controls='separator-sidebar'
        type='button'
        className='inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
      >
        <span className='sr-only'>Open sidebar</span>
        <Bars3Icon />
      </IconButton>
      <aside
        id='separator-sidebar'
        className=' left-0 z-0 flex h-screen  sm:translate-x-0'
        aria-label='Sidebar'
      >
        <div className='h-full px-1 py-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 border-r-2 border-black/50'>
          <ul className='space-y-2 font-medium'>
            <li>
              <Link
                href='/dash'
                className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <Tooltip content={t('home')} placement='right-end'>
                  <RiDashboardLine className='h-6 w-6 text-gray-500' />
                </Tooltip>
              </Link>
            </li>
            <li>
              <Link
                href={{ pathname: '/dash/inbox' }}
                className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <Tooltip content={t('inbox')} placement='right-end'>
                  <InboxArrowDownIcon className='text-gray-500 h-6'>
                    <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900'>
                      10
                    </div>
                  </InboxArrowDownIcon>
                </Tooltip>
              </Link>
            </li>
          </ul>
        </div>

        {children}
      </aside>
    </>
  );
}
