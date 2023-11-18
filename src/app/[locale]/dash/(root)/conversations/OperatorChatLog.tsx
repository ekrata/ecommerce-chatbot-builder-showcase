'use client'

import { useFormatter, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo } from 'react';
import { BsChat } from 'react-icons/bs';

import { ConversationItem } from '@/entities/conversation';
import { useConfigurationQuery } from '@/src/app/[locale]/(hooks)/queries/useConfigurationQuery';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useCreateMessageMut } from '../../../(hooks)/mutations/useCreateMessageMut';
import { useDashSocketContext } from '../DashSocketProvider';
import { CustomerAvatar } from './CustomerAvatar';
import { OperatorMessageTimeLabel } from './OperatorMessageTimeLabel';

interface Props {
  conversationItem: ConversationItem
}
/**
 * Renders a chat log from the perspective of a customer, in the chat widget.
 * @date 13/06/2023 - 12:09:16
 *
 * @returns {*}
 */
export const OperatorChatLog: FC<Props> = ({ conversationItem }) => {
  const t = useTranslations('dash')
  const [operatorSession] = useAuthContext();
  const ws = useDashSocketContext()
  const searchParams = useSearchParams()
  const conversationId = searchParams?.get('conversationId')
  const orgId = operatorSession?.orgId ?? ''

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }

  // Observing message creation/sending state
  const createMessageMut = useCreateMessageMut(orgId, conversationItem?.customerId ?? '', conversationId ?? '')
  const { relativeTime } = useFormatter()
  const noData = <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
    <h5 className='flex font-semibold'><BsChat />{t('Select a conversation to view it here', { count: 0 })}</h5>
    {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
  </div>

  const renderContent = useMemo(() => {
    return <div
      className="flex flex-col w-full h-full py-2 pb-8 overflow-y-scroll text-sm bg-white gap-y-1 dark:bg-gray-800"
      data-testid="chat-log"
    >
      {conversationItem?.messages
        ?.map((message, i) => {
          return (
            <div className="px-4" key={message.messageId} data-testid={`message-${message.messageId}`}>
              {(message?.sender === 'customer') && (
                <div>
                  <div className="flex flex-row w-3/4 chat chat-start gap-x-2 animate-fade-right" >
                    <div className="flex text-center w-30 h-30 place-items-center ">
                      <CustomerAvatar conversationItem={conversationItem} customer={conversationItem?.customer} showTypingState={true} />
                    </div>
                    <p className={`justify-start p-2 rounded-md place-items-start  flex-initial dark:bg-gray-600 bg-gray-100 ${!message.sentAt && 'animate-pulse'
                      } tooltip-bottom z-10`}
                      data-testid={`operator-message-content-${message.messageId}`}
                      data-tip={<OperatorMessageTimeLabel conversationItem={conversationItem} />}
                    >
                      {message?.content}
                    </p>
                  </div>
                  {i + 1 === conversationItem?.messages?.length && (
                    <div className="flex justify-start place-items-center animate-fade-right ">
                      <OperatorMessageTimeLabel conversationItem={conversationItem} />
                    </div>
                  )}
                </div>
              )}
              {(message.sender === 'operator' || message.sender === 'bot') && (
                <div className="flex flex-col ml-32 chat chat-end animate-fade-left">
                  <div className="min-h-0 p-2 px-4 bg-gray-200 rounded-md " data-testid={`customer-message-content-${message.messageId}`}>
                    {message?.content}
                  </div>
                  {i + 1 === conversationItem?.messages?.length && (
                    <div className="flex justify-end place-items-center">
                      {createMessageMut.isLoading ? 'Sending...' : <OperatorMessageTimeLabel conversationItem={conversationItem} />}
                    </div>
                  )}
                </div>
              )
              }
            </div>
          )
        })
      }
    </div >

  }, [conversationItem?.lastMessageAt, createMessageMut.isSuccess, conversationItem?.messages?.length, conversationItem?.messages?.slice(-1)?.[0]?.messageId])
  return renderContent
}
