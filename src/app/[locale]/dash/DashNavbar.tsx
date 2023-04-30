import { Link, useTranslations } from 'next-intl';
import { IoMdChatboxes } from 'react-icons/io';
import { MdOutlineDashboard } from 'react-icons/md';

export default function DashNavbar() {
  const t = useTranslations('app.layout');
  const unreadMessages = 5;

  return (
    <ul className=''>
      <li>
        <Link
          href={{ pathname: '/dash' }}
          key='dash'
          className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('home')}>
            <MdOutlineDashboard className='h-6 w-6 text-gray-500' />
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: '/dash/inbox' }}
          key='dash'
          className=' flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          <div className='tooltip lg:tooltip-right' data-tip={t('inbox')}>
            <div className='indicator'>
              <span className='indicator-item badge badge-primary text-xs'>
                {unreadMessages}
              </span>
              <IoMdChatboxes className='text-gray-500 h-6 w-6' />
            </div>
          </div>
        </Link>
      </li>
    </ul>
  );
}
