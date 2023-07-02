'use client'

import { FC,  useMemo, useEffect } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { useConfigurationQuery, useConversationItemsQuery } from '../../(hooks)/queries';
import { useCreateMessageMut } from '../../(hooks)/mutations/useCreateMessageMut';
import { MessageTimeLabel } from './MessageTimeLabel';
import { Avatar } from './Avatar';
import { getItem } from '../../(helpers)/helpers';
import { createMessage } from '../../(actions)/orgs/conversations/messages/createMessage';
import { useCustomerQuery } from '../../(hooks)/queries/useCustomerQuery';
import { ConversationItem } from '@/entities/conversation';
import { useSearchParams } from 'next/navigation';

interface Props  {
  conversationItem?: ConversationItem
}

/**
 * Renders a chat log from the perspective of a customer, in the chat widget.
 * @date 13/06/2023 - 12:09:16
 *
 * @returns {*}
 */
export const OperatorChatLog: FC<Props> = ({conversationItem}) => {
    const t = useTranslations('chat-widget')
    const searchParams = useSearchParams()
    const search = searchParams.get('conversationId')
    const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
    const customer = useCustomerQuery(orgId);

    const configuration = useConfigurationQuery(orgId);
    const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}

    // Observing message creation/sending state
    const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', selectedConversationId ?? '' )
    const { relativeTime } = useFormatter()

    return (
    <div
      className="flex flex-col gap-y-1 pb-8 py-2 text-sm w-full bg-base-100 dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {conversationItem?.messages
        ?.map((message, i) => (
          <div className="px-4" key={message.messageId} data-testid={`message-${message.messageId}`}>
            {(message.sender === 'operator' || message.sender === 'bot') && (
              <div className="flex flex-col justify-start w-full gap-x-2" >
                <div className="flex-none w-30 h-30">
                  <div className="indicator">
                    <span
                      data-testid="status-badge"
                      className={`indicator-item  badge-success ring-white ring-2 badge-xs text-white dark:text-default rounded-full ${
                        !message.sentAt
                          ? 'mx-0 my-0 indicator-bottom animate-bounce'
                          : 'my-2 mx-2 indicator-top'
                      }`}
                    >
                      {!message.sentAt ? '...' : ''}
                    </span>
                    <Avatar conversationItem={conversationItem} message={message}/>
                  </div>
                  <p className={`justify-start p-2 rounded-xl place-items-start flex-initial dark:bg-gray-600 bg-gray-100 ${
                    !message.sentAt && 'animate-pulse'
                  } tooltip-bottom z-10`}
                  data-testid={`operator-message-content-${message.messageId}`}
                  data-tip={<MessageTimeLabel conversationItem={conversationItem} message={message}/>}
                >
                  {message.content}
                </p>
              </div>
              {i+1 === conversationItem?.messages?.length && (
                <div className="flex justify-start place-items-center ">
                  <MessageTimeLabel conversationItem={conversationItem} message={message}/>
                </div>
              )}
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="flex flex-col chat chat-end">
                <div className="min-h-0 p-2 bg-gray-900 rounded-3xl text-base-100" data-testid={`customer-message-content-${message.messageId}`}> 
                  {message.content}
                </div>
                {i+1 === conversationItem?.messages?.length && (
                  <div className="flex justify-end place-items-center">
                    {createMessageMut.isLoading ? 'Sending...' : <MessageTimeLabel conversationItem={conversationItem} message={message}/>}
                  </div>
                )}
              </div>
              )}
          </div>
        ))}
    </div>
    )
};
