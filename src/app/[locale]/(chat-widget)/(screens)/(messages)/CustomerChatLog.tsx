import { FC,  useMemo, useEffect } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { useCustomerQuery, useConfigurationQuery, useConversationItemsQuery } from '../../(hooks)/queries';
import { useCreateMessageMut } from '../../(hooks)/mutations';
import { MessageTimeLabel } from './MessageTimeLabel';
import { Avatar } from './Avatar';
import { getItem } from '../../(helpers)/helpers';
import { createMessage } from '../../(actions)/conversations/messages/createMessage';

interface Props  {
  conversationId: string
}

/**
 * Renders a chat log from the perspective of a customer, in the chat widget.
 * @date 13/06/2023 - 12:09:16
 *
 * @returns {*}
 */
export const CustomerChatLog: FC = ({}) => {
    const t = useTranslations('chat-widget')
    const {chatWidget: {selectedConversationId}} = useChatWidgetStore();
    const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
    const customer = useCustomerQuery(orgId, '');
    const conversationItems = useConversationItemsQuery(orgId, customer?.data?.customerId ?? '')
    const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
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
          <div className="px-4" key={message.messageId}>
            {(message.sender === 'operator' || message.sender === 'bot') && (
              <div className="flex gap-x-2 w-full justify-start flex-col" >
                <div className="w-30 h-30 flex-none">
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
                  data-tip={<MessageTimeLabel conversationItem={conversationItem} message={message}/>}
                >
                  {message.content}
                </p>
              </div>
              {i+1 === conversationItem?.messages?.length && (
                <div className="flex place-items-center justify-start ">
                  <MessageTimeLabel conversationItem={conversationItem} message={message}/>
                </div>
              )}
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="chat chat-end flex flex-col">
                <div className="min-h-0 rounded-3xl p-2 bg-gray-900 text-base-100"> 
                  {message.content}
                </div>
                {i+1 === conversationItem?.messages?.length && (
                  <div className="flex place-items-center justify-end">
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
