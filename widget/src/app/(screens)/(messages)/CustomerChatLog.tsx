import { EntityItem } from 'electrodb';
import { useFormatter, useTranslations } from 'next-intl';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useCreateMessageMut } from 'src/app/(actions)/mutations/useCreateMessageMut';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from 'src/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { sortConversationItems } from 'src/app/(helpers)/sortConversationItems';

import { Message, messageFormType } from '@/entities/message';
import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
import { AskAQuestionMessageForm } from './(message-forms)/AskAQuestionMessageForm';
import { Avatar } from './Avatar';
import { CustomerMessageTimeLabel } from './CustomerMessageTimeLabel';

interface Props {
  conversationId: string
}

/**
 * Renders a chat log from the perspective of a customer, in the chat widget.
 * @date 13/06/2023 - 12:09:16
 *
 * @returns {*}
 */
export const CustomerChatLog: FC = ({ }) => {
  const t = useTranslations('chat-widget')
  const { chatWidget: { selectedConversationId } } = useChatWidgetStore();
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const customer = useCustomerQuery(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '')
  console.log(conversationItems)
  console.log(selectedConversationId)
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  console.log(conversationItem)
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }

  // Observing message creation/sending state
  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', selectedConversationId ?? '')
  const { relativeTime } = useFormatter()

  const getForm = (message: EntityItem<typeof Message>) => {
    switch (message?.messageFormType) {
      case Action.AskAQuestion:
        return <AskAQuestionMessageForm message={message} />
      default:
        return <></>
    }
  }


  return (
    <div
      className="flex flex-col gap-y-1 pb-8 py-2 text-sm w-full bg-base-100 dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {conversationItem?.messages
        ?.map((message, i) => (
          <div className="px-4" key={message.messageId} data-testid={`message-${message.messageId}`}>
            {message.sender === 'bot' && message?.messageFormType && (
              <div className="flex flex-col chat chat-end">
                {getForm(message)}
                {/* <div className="min-h-0 p-2 bg-gray-900 rounded-3xl text-base-100" data-testid={`customer-message-content-${message.messageId}`}>
                  
                </div> */}
                {/* {i + 1 === conversationItem?.messages?.length && (
                  <div className="flex justify-end place-items-center">
                    <CustomerMessageTimeLabel conversationItem={conversationItem} />
                  </div>
                )} */}
              </div>
            )}
            {(message.sender === 'operator' || (message.sender === 'bot' && !message?.messageFormType)) && (
              <div className="flex flex-col justify-start w-full gap-x-2 gap-y-1" >
                <div className="flex flex-row place-items-center gap-x-2">
                  <Avatar conversationItem={conversationItem} message={message} toggleIndicator={(conversationItem?.messages.length) === i + 1} />
                  <p className={`justify-start p-2 rounded-xl place-items-start flex-initial dark:bg-gray-600 bg-gray-100 ${!message.sentAt && 'animate-pulse'
                    } tooltip-bottom z-10`}
                    data-testid={`operator-message-content-${message.messageId}`}
                    data-tip={<CustomerMessageTimeLabel conversationItem={conversationItem} />}
                  >
                    {message.content}
                  </p>
                </div>
                {i + 1 === conversationItem?.messages?.length && (
                  <div className="flex justify-start place-items-center ">
                    <CustomerMessageTimeLabel conversationItem={conversationItem} />
                  </div>
                )}
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="flex flex-col chat chat-end">
                <div className="min-h-0 p-2 bg-gray-900 rounded-3xl text-base-100" data-testid={`customer-message-content-${message.messageId}`}>
                  {message.content}
                </div>
                {i + 1 === conversationItem?.messages?.length && (
                  <div className="flex justify-end place-items-center">
                    {createMessageMut.isLoading ? 'Sending...' : <CustomerMessageTimeLabel conversationItem={conversationItem} />}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      }
    </div >
  )
};
