'use client';

import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import { BsFillBoxSeamFill, BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FcClock, FcInTransit, FcPaid } from 'react-icons/fc';

import { ConversationTopic } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';

export const topicIconMap: Record<ConversationTopic, ReactNode> = {
  'products': <FcPaid />,
  'orderStatus': <FcClock />,
  'orderIssues': <BsFillBoxSeamFill className='text-amber-800' />,
  'shippingPolicy': <FcInTransit />
}

export const TopicSelect: React.FC = () => {
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { conversationOperatorView, setConversationOperatorView, setConversationTopic, conversationTopic } = useDashStore()

  return (
    <details className="mb-32 dropdown">
      <summary className="m-1 btn">
        {conversationTopic ? topicIconMap[conversationTopic] : <p>All</p>}
      </summary>
      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        {Object.entries(topicIconMap)?.map(([key, icon]) => (
          <li className='flex' onClick={() => setConversationTopic(key as ConversationTopic)}>
            {icon}
            <p>
              {startCase(key)}
            </p>
            <input type="radio" name="radio-2" className="justify-end radio radio-primary" checked={key === conversationTopic} />
          </li>
        ))}
      </ul>
    </details>
  )

}