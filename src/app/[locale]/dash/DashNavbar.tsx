import { InboxArrowDownIcon } from '@heroicons/react/24/outline';
import { Link, useTranslations } from 'next-intl';
import { RiDashboardLine } from 'react-icons/ri';

export default function FeatureNavbar() {
  const t = useTranslations('app.layout');

  const unreadMessages = 5;

  return (
    <ul className='space-y-2 space-x-2 font-medium'>
      <li>
        <Link
          href={{ pathname: '/dash' }}
          key='dash'
          className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('home')}>
            <RiDashboardLine className='h-6 w-6 text-gray-500' />
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: '/dash/inbox' }}
          key='dash'
          className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('inbox')}>
            <div className='indicator'>
              <span className='indicator-item badge badge-primary'>
                {unreadMessages}
              </span>
              <InboxArrowDownIcon className='text-gray-500 h-6' />
            </div>
          </div>
        </Link>
      </li>
    </ul>
  );
}
