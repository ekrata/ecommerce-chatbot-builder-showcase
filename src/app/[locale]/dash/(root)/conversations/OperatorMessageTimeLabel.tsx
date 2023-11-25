import { useFormatter, useTranslations } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { BsPerson, BsRobot } from 'react-icons/bs';

import { ConversationItem } from '@/entities/conversation';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useOperatorsQuery } from '../../../(hooks)/queries/useOperatorsQuery';

interface Props {
  conversationItem?: ConversationItem,
  updateFreq?: number
  highlightedFields?: Record<'customer.email' | 'customer.name', ReactNode[] | undefined>
}

export const OperatorMessageTimeLabel: React.FC<Props> = ({ conversationItem, updateFreq = 20000, highlightedFields }) => {
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

  const composeHighlightedFields = () => {
    if (highlightedFields?.['customer.name']?.length) {
      return highlightedFields?.['customer.name']?.map((child) => <>{child}</>)
    }
    else if (highlightedFields?.['customer.email']?.length) {
      console.log(highlightedFields?.['customer.email']?.map((child) => <>{child}</>))
      return (<>{highlightedFields?.['customer.email']?.map((child) => <>{child}</>)}</>)

    }
    return null
  }

  return (
    <div className='flex place-items-center'>
      <p className="inline-flex text-xs text-neutral-400 place-items-center ">
        {(message?.sender === 'customer' && composeHighlightedFields()) ?? conversationItem?.customer?.name ?? conversationItem?.customer?.email}
        {message?.sender === 'operator' &&
          <div className='inline-flex place-items-center gap-x-1'>
            <BsPerson />

            {/* {highlightedFields?.['customer.email']?.map((child) => <>{child}</>)} */}
            {(sessionOperator?.operatorId === message.operatorId ? `${t('You')}` : lastMessageOperator?.name ?? lastMessageOperator?.email)}
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