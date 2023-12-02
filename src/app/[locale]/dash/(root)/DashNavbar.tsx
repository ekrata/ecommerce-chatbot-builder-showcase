'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { BiChart, BiHelpCircle } from 'react-icons/bi';
import { BsFillPeopleFill, BsRobot } from 'react-icons/bs';
import { CgWebsite } from 'react-icons/cg';
import { IoMdChatboxes } from 'react-icons/io';
import { MdOutlineDashboard } from 'react-icons/md';
import { PiBrowsersFill } from 'react-icons/pi';
import { TbSettings } from 'react-icons/tb';
import { useLocalStorage } from 'usehooks-ts';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { useConversationItemsQuery } from '../../(hooks)/queries/useConversationItemsQuery';
import { useOrgQuery } from '../../(hooks)/queries/useOrgQuery';
import ekrataLogo from '../../../../../public/graphics/ekrataLogo.png';
import { useDashStore } from './(actions)/useDashStore';

export default function DashNavbar() {
  const locale = useLocale()
  const { conversationListFilter } = useDashStore()
  const [sessionOperator] = useAuthContext()
  const orgQuery = useOrgQuery(sessionOperator?.orgId ?? '')
  const t = useTranslations('app.layout');
  const [readMessages] = useLocalStorage<Record<string, boolean>>('readMessages', {});
  const conversationItemsQuery = useConversationItemsQuery(conversationListFilter)


  const unreadMessages = conversationItemsQuery?.data?.data?.reduce((prev, curr) => {
    const lastMessage = curr?.messages?.slice(-1)[0]
    if (readMessages?.[`${curr?.conversationId}+${lastMessage?.messageId}`] || (lastMessage?.sender === 'operator' && lastMessage?.operatorId === sessionOperator?.operatorId)) {
      return prev - 1
    }
    return prev
  }, conversationItemsQuery?.data?.data?.length ?? 0)


  const getIssues = () => {
    // type Issue: {
    //   type: 'org-domain',
    //     name: 'Set Organisation Domain',
    //       description: "You haven't set a domain for your organisation. "
    // }
    let issues = []
    if (!orgQuery?.data?.domain) {

    }

    return []
  }

  return (
    <ul className='z-20 flex flex-col text-gray-400 normal-case bg-black place-items-center hover:bg-opacity-0'>
      <li>
        <Link
          href="/"
          key='home'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right hover:bg-opacity-0' data-tip={t('home')}>
            <Image src={ekrataLogo} alt='Ekrata logo' className='max-w-none' width={32} height={40} />
            {/* <MdOutlineDashboard className='w-6 h-6' /> */}
          </div>
        </Link>
      </li>
      <li>
        <Link
          href={{ pathname: "/dash/analytics" }}
          key='analytics'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('analytics')}>
            <div className='indicator'>

              {/* {unreadMessages != null && unreadMessages > 0 &&
                <span className='-m-1 text-xs bg-opacity-100 border-0 rounded-md indicator-item badge bg-gradient-to-tr from-violet-500 to-orange-300 '>
                  {unreadMessages}
                </span>

              } */}
              <BiChart className='w-6 h-6' />
            </div>
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

              {unreadMessages != null && unreadMessages > 0 &&
                <span className='-m-1 text-xs bg-opacity-100 border-0 rounded-md indicator-item badge bg-gradient-to-tr from-violet-500 to-orange-300 '>
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
            {/* <span className='text-xs indicator-item badge badge-info'>
                0
              </span> */}
            <BsRobot className='w-6 h-6' />
          </div>
        </Link>
      </li>
      <li >
        <Link
          href={{ pathname: "/dash/sandbox" }}
          key='sandbox'
          rel="noopener noreferrer"
          target="_blank"
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('sandbox')}>
            <PiBrowsersFill className='w-6 h-6 text-gray-400' />
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

      <li className='absolute bottom-0 '>
        <Link
          href={{ pathname: "/dash/settings" }}
          key='settings'
          className='flex btn btn-ghost hover:bg-opacity-0'
        >
          <div className='normal-case tooltip lg:tooltip-right' data-tip={t('settings')}>
            <div className='indicator'>
              {unreadMessages != null && unreadMessages > 0 &&
                <span className='-m-1 text-xs bg-opacity-100 border-0 rounded-md indicator-item badge badge-error '>
                  {unreadMessages} Errors
                </span>

              }
              <TbSettings className='w-6 h-6 text-gray-400' />
            </div>
          </div>
        </Link>
      </li>


    </ul >
  );
}
