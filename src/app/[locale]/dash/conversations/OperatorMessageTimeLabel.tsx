import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ConversationItem } from '@/entities/conversation';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useOperatorsQuery } from '../../(hooks)/queries/useOperatorsQuery';

interface Props {
  conversationItem?: ConversationItem,
  updateFreq?: number
}

export const OperatorMessageTimeLabel: React.FC<Props> = ({ conversationItem, updateFreq = 20000 }) => {
  const { relativeTime } = useFormatter();
  const t = useTranslations('chat-widget');
  const [sessionOperator] = useAuthContext()
  const [dateNow, setDateNow] = useState(new Date())
  const message = conversationItem?.messages?.slice(-1)?.[0]


  useEffect(() => {
    setTimeout(() => setDateNow(new Date()), updateFreq)
  }, [dateNow])


  const operatorsQuery = useOperatorsQuery(sessionOperator?.orgId ?? '')
  const lastMessageOperator = operatorsQuery?.data?.find(operator => operator.operatorId === message?.operatorId)


  let time = relativeTime(message?.sentAt ?? 0, dateNow)
  if (time.includes('second') && parseInt(time.split(' ')[0]) < 20) {
    time = t('just now')
  }

  return (
    <div className='flex place-items-center'>
      <p className="text-xs text-neutral-400 place-items-center">
        {message?.sender === 'customer' && (conversationItem?.customer?.name ?? conversationItem?.customer?.email)}
        {message?.sender === 'operator' && (sessionOperator?.operatorId === message.operatorId ? `${t('You')}` : lastMessageOperator?.name ?? lastMessageOperator?.email)}
        {message?.sender === 'operator' && `${t('You')}`}
        {message?.sender === 'bot' && `${t('Bot')}`}
        {` · ${message?.sentAt && time}.`}
      </p>
    </div>
  )
}