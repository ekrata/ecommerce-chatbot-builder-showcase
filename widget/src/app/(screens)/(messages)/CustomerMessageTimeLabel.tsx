import { EntityItem } from 'electrodb';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BsPerson, BsRobot } from 'react-icons/bs';

import { ConversationItem } from '@/entities/conversation';

interface Props {
  conversationItem?: ConversationItem,
  updateFreq?: number
}

export const CustomerMessageTimeLabel: React.FC<Props> = ({ conversationItem, updateFreq = 20000 }) => {
  const { relativeTime } = useFormatter();
  const t = useTranslations('chat-widget');
  const [dateNow, setDateNow] = useState(new Date())
  const message = conversationItem?.messages?.slice(-1)?.[0]

  useEffect(() => {
    setTimeout(() => setDateNow(new Date()), updateFreq)
  }, [dateNow])


  let time = relativeTime(message?.sentAt ?? 0, dateNow)
  if (time.includes('second') && parseInt(time.split(' ')[0]) < 20) {
    time = t('just now')
  }

  return (
    <div className='flex place-items-center'>
      <p className="inline-flex text-xs text-neutral-400 place-items-center ">
        {((message?.sender === 'customer' && `${t('You')}`) ?? conversationItem?.customer?.name ?? conversationItem?.customer.email)}
        {message?.sender === 'operator' &&
          <div className='inline-flex place-items-center gap-x-1'>
            <BsPerson />
            {conversationItem?.operator?.name ?? conversationItem?.operator?.email}
          </div>}
        {message?.sender === 'bot' &&
          <div className='inline-flex place-items-center gap-x-1'>
            <BsRobot />
            {t('Bot')}
          </div>}
        {` · ${message?.sentAt && time}.`}
      </p>
    </div>
  )
}