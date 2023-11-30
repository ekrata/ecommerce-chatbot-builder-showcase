'use client';

import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { BsFillBoxSeamFill, BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';
import { FcClock, FcInTransit, FcPaid } from 'react-icons/fc';
import { MdOutlineTopic } from 'react-icons/md';
import { TbBracketsContain } from 'react-icons/tb';

import { ConversationTopic } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';

export const topicIconMap: Record<ConversationTopic | 'all', ReactNode> = {
  '': <MdOutlineTopic />,
  'all': <MdOutlineTopic />,
  'products': < FcPaid />,
  'orderStatus': <FcClock />,
  'orderIssues': <BsFillBoxSeamFill className='text-amber-600/75' />,
  'shippingPolicy': <FcInTransit />
}

interface Props {
  dropdownPosition?: 'end'
}

export const TopicSelect: React.FC<Props> = ({ dropdownPosition }) => {
  const t = useTranslations('dash');
  const [sessionOperator] = useAuthContext();
  const { setConversationListFilter, conversationListFilter } = useDashStore()
  const { topic } = conversationListFilter

  return (
    <details className={`h-full w-full dropdown ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row px-2 normal-case gap-x-1 flex-nowrap text-normal btn btn-ghost">
        {topic ? <div className='text-2xl'>
          {topicIconMap[topic]}
        </div> : <MdOutlineTopic className='text-2xl' />}
        <FaChevronDown className='' />
      </summary>
      <ul className="font-sans shadow menu font-normal dropdown-content z-[1] bg-base-100 text-sm rounded-box w-52 overflow-y-clip max-w-screen animate-fade-left">
        <p className='border-b-[1px] justify-center text-center bg-black text-white'>{t('Topic')}</p>
        {Object.entries(topicIconMap)?.map(([key, icon]) => (
          <li key={key} className='flex flex-row justify-start normal-case place-items-center' onClick={(event) => {
            if (key === 'all') {
              setConversationListFilter({ ...conversationListFilter, topic: undefined })
            } else {
              setConversationListFilter({ ...conversationListFilter, topic: key as ConversationTopic })
            }
          }} >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>
              <input type="radio" name={`radio-topic`} className="form-control radio-primary radio-xs" defaultChecked={topic === key || (topic === undefined && key === 'all')} />
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