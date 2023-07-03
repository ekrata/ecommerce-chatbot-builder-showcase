'use client';

import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import FbMessengerIcon from 'public/brands/FbMessengerIcon.svg';
import InstagramIcon from 'public/brands/InstagramIcon.svg';
import WhatsappIcon from 'public/brands/WhatsappIcon.svg';
import { ReactNode, useEffect } from 'react';
import { BsFillBoxSeamFill, BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FcClock, FcInTransit, FcPaid, FcShop } from 'react-icons/fc';

import { ConversationChannel, ConversationTopic, conversationTopic } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { topicIconMap } from './TopicSelect';

export const channelIconMap: Record<ConversationChannel, ReactNode> = {
  'website': <FcShop />,
  'messenger': <Image priority src={FbMessengerIcon} alt="Fb messenger" />,
  'whatsapp': <Image priority src={WhatsappIcon} alt="Whatsapp" />,
  'instagram': <Image priority src={InstagramIcon} alt="Instagram" />
}



export const ChannelSelect: React.FC = () => {
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { setConversationChannel, conversationChannel } = useDashStore()

  return (
    <details className="mb-32 dropdown">
      <summary className="m-1 btn">
        {conversationChannel ? channelIconMap[conversationChannel] : <p>All</p>}
      </summary>
      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        {Object.entries(topicIconMap)?.map(([key, icon]) => (
          <li className='flex' onClick={() => setConversationChannel(key as ConversationChannel)}>
            {icon}
            <p>
              {startCase(key)}
            </p>
            <input type="radio" name="radio-2" className="justify-end radio radio-primary" checked={key === conversationChannel} />
          </li>
        ))}
      </ul>
    </details>
  )

}