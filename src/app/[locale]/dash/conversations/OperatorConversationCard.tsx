'use-client'
import { Link, useFormatter, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { BiSend } from 'react-icons/bi';

import { ConversationItem } from '@/entities/conversation';

import { CustomerAvatar } from './CustomerAvatar';
import { OperatorMessageTimeLabel } from './OperatorMessageTimeLabel';

interface Props {
  conversationItem: ConversationItem
  height: string,
  rounded?: boolean
  showRecentLabel?: boolean
}

/**
 * Renders a chat containing info about a conversation from the perspective of an operator. Clicking on it creates a new conversation and redirects to the chat screen. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const OperatorConversationCard: React.FC<Props> = ({ conversationItem, height = '12', rounded = false, showRecentLabel }) => {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const { relativeTime } = useFormatter()
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);

  const lastMessage = useMemo(() => {
    return conversationItem?.messages?.slice(-1)[0]
  }, [conversationItem])


  return (
    <Link key={conversationItem.conversation.conversationId} href={{ pathname: '/dash/conversations', query: { conversationId: conversationItem.conversation.conversationId } }}>
      <button className={`btn btn-ghost block ${rounded && 'rounded-3xl'} font-light justify-between h-${height}  normal-case place-items-center animate-fade-left w-full  text-sm`}>
        <div className="flex justify-around place-items-center animate-fade-left">
          <div className="w-12 h-12 p-2 rounded-full avatar shrink-0 background ring-2 ring-primary online">
            <CustomerAvatar conversationItem={conversationItem} />
          </div>
          <div className="flex flex-col w-3/5 place-items-start gap-y-1">
            <h5 className='justify-start w-full text-base break-all truncate font-base justify-self-start'>{`${lastMessage?.content}`}</h5>
            <div className="flex text-xs text-neutral-400 gap-x-1 ">
              <OperatorMessageTimeLabel conversationItem={conversationItem} />
            </div>
          </div>
          <BiSend className="text-2xl shrink-0 justify-self-end justify-right " />
        </div>
      </button >
    </Link >
  )
}