'use client'

import { useFormatter, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo } from 'react';

import { ConversationItem } from '@/entities/conversation';

import { Avatar } from '../../(chat-widget)/(screens)/(messages)/Avatar';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useCreateMessageMut } from '../../(hooks)/mutations/useCreateMessageMut';
import { useConfigurationQuery } from '../../(hooks)/queries';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { useCustomerQuery } from '../../(hooks)/queries/useCustomerQuery';
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

  const t = useTranslations('chat-widget')
  const operatorSession = useOperatorSession();
  const searchParams = useSearchParams()
  const conversationId = searchParams?.get('conversationId')
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const customer = useCustomerQuery(orgId);

  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }

  // Observing message creation/sending state
  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', conversationId ?? '')
  const { relativeTime } = useFormatter()

  return (
    <div
      className="flex flex-col gap-y-1 pb-8 py-2 text-sm w-full bg-base-100 dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {conversationItem?.messages
        ?.map((message, i) => (
          <div className="px-4" key={message.messageId} data-testid={`message-${message.messageId}`}>
            {(message.sender === 'customer') && (
              <div className="flex flex-col w-full chat chat-start gap-x-2" >
                <div className="flex-none w-30 h-30">
                  {/* <div className="indicator">
                    <span
                      data-testid="status-badge"
                      className={`indicator-item  badge-success ring-white ring-2 badge-xs text-white dark:text-default rounded-full ${!message.sentAt
                        ? 'mx-0 my-0 indicator-bottom animate-bounce'
                        : 'my-2 mx-2 indicator-top'
                        }`}
                    >
                      {!message.sentAt ? '...' : ''}
                    </span>
                    <CustomerAvatar conversationItem={conversationItem} message={message} />
                  </div> */}
                  <p className={`justify-start p-2 rounded-xl place-items-start flex-initial dark:bg-gray-600 bg-gray-100 ${!message.sentAt && 'animate-pulse'
                    } tooltip-bottom z-10`}
                    data-testid={`operator-message-content-${message.messageId}`}
                    data-tip={<OperatorMessageTimeLabel conversationItem={conversationItem} />}
                  >
                    {message.content}
                  </p>
                </div>
                {i + 1 === conversationItem?.messages?.length && (
                  <div className="flex justify-start place-items-center ">
                    <OperatorMessageTimeLabel conversationItem={conversationItem} />
                  </div>
                )}
              </div>
            )}
            {message.sender === 'operator' || message.sender === 'bot' && (
              <div className="flex flex-col chat chat-end">
                <div className="min-h-0 p-2 bg-gray-900 rounded-3xl text-base-100" data-testid={`customer-message-content-${message.messageId}`}>
                  {message.content}
                </div>
                {i + 1 === conversationItem?.messages?.length && (
                  <div className="flex justify-end place-items-center">
                    {createMessageMut.isLoading ? 'Sending...' : <OperatorMessageTimeLabel conversationItem={conversationItem} />}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  )
};
