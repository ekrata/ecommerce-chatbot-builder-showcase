'use client';

import { startCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FcCheckmark, FcLink, FcMediumPriority, FcPaid, FcShop } from 'react-icons/fc';
import { TbStatusChange } from 'react-icons/tb';

import {
  ConversationChannel, ConversationStatus, ConversationTopic, conversationTopic
} from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { topicIconMap } from './TopicSelect';

export const statusIconMap: Record<ConversationStatus | 'all', ReactNode> = {
  'all': <TbStatusChange className='text-2xl' />,
  'unassigned': < FcMediumPriority />,
  'open': <FcLink />,
  'solved': <FcCheckmark />,
}

interface Props {
  dropdownPosition?: 'end'
}

export const StatusSelect: React.FC<Props> = ({ dropdownPosition }) => {
  const t = useTranslations('dash');
  const [sessionOperator] = useAuthContext();
  const { setConversationListFilter, conversationListFilter } = useDashStore()

  const { status } = conversationListFilter
  return (
    <details className={`h-full w-full dropdown ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row px-2 normal-case gap-x-1 flex-nowrap text-normal btn btn-ghost">
        {status ? <div className='text-2xl'>
          {statusIconMap[status]}
        </div> : <TbStatusChange className='text-2xl' />}
        <FaChevronDown className='' />
      </summary>
      <ul className="shadow menu font-normal dropdown-content z-[1] bg-base-100 text-sm rounded-box w-52 overflow-y-clip max-w-screen animate-fade-left">
        <p className='border-b-[1px] justify-center text-center bg-black text-white'>{t('Status')}</p>
        {Object.entries(statusIconMap)?.map(([key, icon]) => (
          <li key={key} className='flex flex-row justify-start normal-case place-items-center' >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>
              <input type="radio" name={`radio-status`} className="form-control radio-primary radio-xs" defaultChecked={status === key || (status === undefined && key === 'all')} onClick={() => {
                if (key === 'all') {
                  setConversationListFilter({ ...conversationListFilter, status: undefined })
                } else {
                  setConversationListFilter({ ...conversationListFilter, status: key as ConversationStatus })
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