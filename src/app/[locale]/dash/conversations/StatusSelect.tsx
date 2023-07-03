'use client';

import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { BsFillBoxSeamFill, BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import {
  FcCheckmark, FcClock, FcHighPriority, FcInTransit, FcLink, FcPaid, FcShop
} from 'react-icons/fc';

import {
  ConversationChannel, ConversationStatus, ConversationTopic, conversationTopic
} from '@/entities/conversation';
import FbMessengerIcon from '@/public/';
import FbMessengerIcon from '@/public/brands/FbMessengerIcon';
import InstagramIcon from '@/public/brands/InstagramIcon.svg';
import WhatsappIcon from '@/public/brands/WhatsappIcon.svg';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { topicIconMap } from './TopicSelect';

export const statusIconMap: Record<ConversationStatus, ReactNode> = {
  'unassigned': <FcHighPriority />,
  'open': <FcLink />,
  'solved': <FcCheckmark />,
}



export const StatusSelect: React.FC = () => {
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { setConversationStatus, conversationStatus } = useDashStore()

  return (
    <details className="mb-32 dropdown">
      <summary className="m-1 btn">
        {conversationStatus ? statusIconMap[conversationStatus] : <p>Any status</p>}
      </summary>
      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        {Object.entries(topicIconMap)?.map(([key, icon]) => (
          <li className='flex' onClick={() => setConversationStatus(key as ConversationStatus)}>
            {icon}
            <p>
              {startCase(key)}
            </p>
            <input type="radio" name="radio-2" className="justify-end radio radio-primary" checked={key === conversationStatus} />
          </li>
        ))}
      </ul>
    </details>
  )

}