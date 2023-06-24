import { ConversationItem } from "@/entities/conversation"
import { Message } from "@/entities/message"
import { EntityItem } from "electrodb"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
  updateFreq?: number
}

export const MessageTimeLabel: React.FC<Props> = ({conversationItem, message, updateFreq = 20000}) => {
  const {relativeTime} = useFormatter();
  const t = useTranslations('chat-widget');
  const [dateNow, setDateNow] = useState(new Date())

  useEffect(() => {
    setTimeout(() => setDateNow(new Date()), updateFreq)
  }, [dateNow])


  let time = relativeTime(message?.sentAt ?? 0, dateNow)
  if (time.includes('second') && parseInt(time.split(' ')[0]) < 20) {
    time = t('just now')
  }
  return (
    <div className='flex place-items-center'>
      <p className="text-xs place-items-center">
        {message?.sender === 'operator' && conversationItem?.conversation?.operator?.name}
        {message?.sender === 'customer' && `${t('You')}`}
        {message?.sender === 'bot' && `${t('Bot')}`}
        {` · ${message?.sentAt && time}.`}
      </p>
    </div>
  )
}