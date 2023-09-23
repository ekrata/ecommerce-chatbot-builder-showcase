'use client';

import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { BsFillBoxSeamFill, BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';
import {
  FcCheckmark, FcClock, FcHighPriority, FcInTransit, FcLink, FcMediumPriority, FcPaid, FcShop
} from 'react-icons/fc';
import { TbStatusChange } from 'react-icons/tb';

import {
  ConversationChannel, ConversationStatus, ConversationTopic, conversationTopic
} from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { topicIconMap } from './TopicSelect';

export const statusIconMap: Record<ConversationStatus, ReactNode> = {
  'unassigned': <FcMediumPriority />,
  'open': <FcLink />,
  'solved': <FcCheckmark />,
}

interface Props {
  dropdownPosition?: 'end'
}

export const StatusSelect: React.FC<Props> = ({ dropdownPosition }) => {
  const t = useTranslations('dash');
  const [sessionOperator] = useAuthContext();
  const { setConversationStatus, conversationStatus } = useDashStore()

  return (
    <details className={`h-full w-full dropdown ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row px-2 normal-case gap-x-1 flex-nowrap text-normal btn btn-ghost">
        {conversationStatus ? <div className='text-2xl'>
          {statusIconMap[conversationStatus]}
        </div> : <TbStatusChange className='text-2xl' />}
        <FaChevronDown className='' />
      </summary>
      <ul className="p-2 shadow menu font-normal dropdown-content z-[1] bg-base-100 text-sm rounded-box w-52 overflow-y-clip max-w-screen animate-fade-left">
        {Object.entries(statusIconMap)?.map(([key, icon]) => (
          <li className='flex flex-row justify-start normal-case place-items-center' >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>
              <input type="radio" name={`radio-${key}`} className="form-control radio-primary radio-xs" checked={key === conversationStatus} onClick={() => {
                if (key === conversationStatus) {
                  setConversationStatus()
                } else {
                  setConversationStatus(key as ConversationStatus)
                }
              }} />
              <div className='flex text-sm place-items-center gap-x-2'>
                <div className='text-2xl'>
                  {icon}
                </div>
                {startCase(key)}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}