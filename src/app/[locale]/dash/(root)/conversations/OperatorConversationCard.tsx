'use-client'
import { Link, useFormatter, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { BiSend } from 'react-icons/bi';
import { useQueryParams } from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { useLocalStorage } from 'usehooks-ts';

import { ConversationItem } from '@/entities/conversation';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
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
  const { relativeTime } = useFormatter()
  const [sessionOperator] = useAuthContext();
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);

  // array of read strings with key conversationId+messageId
  const [readMessages, setReadMessages] = useLocalStorage<Record<string, boolean>>('readMessages', {})


  const lastMessage = useMemo(() => {
    return conversationItem?.messages?.slice(-1)[0]
  }, [conversationItem, conversationItem.messages.slice(-1)[0]?.messageId])

  const readMessageId = `${lastMessage.conversationId}+${lastMessage.messageId}`
  return (
    <Link onClick={() => setReadMessages({ ...readMessages, [`${readMessageId}`]: true })} key={conversationItem?.conversationId} href={{ pathname: '/dash/conversations', query: { conversationId: conversationItem?.conversationId } }} className='flex w-full' >
      <button className={`btn btn-ghost block  rounded-none ${rounded && 'rounded-3xl'} font-light pl-0  h-${height}   flex justify-between normal-case place-items-center  w-full  text-sm px-2`}>
        <div className="flex justify-between w-full place-items-center animate-fade-left">
          <div className='flex flex-row justify-between flex-shrink w-[290px] place-items-center'>
            <div className="flex w-12 h-12 p-2 ">
              <CustomerAvatar customer={conversationItem?.customer} conversationItem={conversationItem} />
            </div>
            <div className="flex flex-col flex-shrink w-full place-items-start gap-y-1">
              <h5 className={`justify-start text-start w-full text-sm break-all truncate  justify-self-start ${readMessages?.[readMessageId] || (lastMessage.sender === 'operator' && lastMessage?.operatorId === sessionOperator?.operatorId) ? 'font-normal text-neutral-700' : 'font-semibold'} `}>{`${lastMessage?.content}`}</h5>
              <div className="flex text-xs text-neutral-400 gap-x-1 ">
                <OperatorMessageTimeLabel conversationItem={conversationItem} />
              </div>
            </div>
            {/* <BiSend className="justify-end text-2xl shrink-0 justify-self-end justify-right " /> */}
          </div>
        </div>
      </button >
    </Link >
  )
}