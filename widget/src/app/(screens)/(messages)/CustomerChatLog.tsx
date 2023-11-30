import { EntityItem } from 'electrodb';
import { useFormatter, useTranslations } from 'next-intl';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useCreateMessageMut } from 'src/app/(actions)/mutations/useCreateMessageMut';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from 'src/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { sortConversationItems } from 'src/app/(helpers)/sortConversationItems';
import { useLocalStorage } from 'usehooks-ts';

import { Message, messageFormType } from '@/entities/message';
import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { findNextNodes } from '@/packages/functions/app/api/src/nodes/getNextNodes';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
import { AskAQuestionMessageForm } from './(message-forms)/AskAQuestionMessageForm';
import { getMessageForm } from './(message-forms)/getMessageForm';
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
  const { chatWidget: { selectedConversationId, setToggleUserMessaging } } = useChatWidgetStore();
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const [botTyping, setBotTyping] = useState<boolean>(false)
  const [latestFormSubmitted, setLatestedFormSubmitted] = useState<boolean>(false)
  const customer = useCustomerQuery(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const [readMessages, setReadMessages] = useLocalStorage<Record<string, boolean>>('readMessages', {})

  const lastMessage = useMemo(() => {
    // get last message that wasn't a form input
    return conversationItem?.messages?.filter((message) => !message?.messageFormType)?.slice(-1)[0]
  }, [conversationItem])

  const readMessageId = `${lastMessage?.conversationId}+${lastMessage?.messageId}`

  // Observing message creation/sending state
  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', selectedConversationId ?? '')
  const { relativeTime } = useFormatter()

  useEffect(() => {
    setReadMessages({ ...readMessages, [`${readMessageId}`]: true })
  }, [conversationItem?.messages])

  useEffect(() => {
    setLatestedFormSubmitted(false)
  }, [conversationItem?.messages?.length, conversationItem?.messages])

  useEffect(() => {
    const message = conversationItem?.messages?.slice(-1)[0];
    console.log('hzi')
    // disable user text input if most recent message is a form and is expecting a user decision.
    if (message?.sender === 'bot' && message?.messageFormType && message?.botStateContext) {
      setToggleUserMessaging(false)
      // if the last message was a form message, the user has selected(content set), and there are next nodes, show the bot as typing 
      const botStateContext = JSON.parse(message?.botStateContext)
      console.log('botStateContext', botStateContext)
      const nextNodes = findNextNodes(botStateContext, conversationItem?.messages ?? [])
      console.log('nextnodes', nextNodes, message?.content)
      if (nextNodes?.length && latestFormSubmitted) {
        console.log('setting bot')
        setBotTyping(true)
      } else {
        setBotTyping(false)
      }
    } else {
      setToggleUserMessaging(true)
      setBotTyping(false)
    }
  }, [conversationItem?.messages?.length, latestFormSubmitted])



  const messageLog = useMemo(() =>
    conversationItem?.messages?.sort((a, b) => a?.createdAt ?? 0 - b?.createdAt ?? 0)
      ?.map((message, i) => (
        <div className="px-4 text-xs" key={message.messageId} data-testid={`message-${message.messageId}`}>
          {message.sender === 'bot' && message?.messageFormType && (
            <div className="flex flex-col chat chat-end animate-fade-left">
              {getMessageForm(message, i + 1 === conversationItem?.messages?.length ? [latestFormSubmitted, setLatestedFormSubmitted] : undefined)}
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
            <div className="flex flex-col justify-start w-full gap-x-2 gap-y-1 animate-fade-right" >
              <div className="flex flex-row place-items-center gap-x-2">
                <Avatar conversationItem={conversationItem} message={message} />
                <p className={`justify-start p-2 rounded-md place-items-start flex-initial dark:bg-gray-600 bg-gray-100 ${!message.sentAt && 'animate-pulse'
                  } tooltip-bottom z-10`}
                  data-testid={`operator-message-content-${message.messageId}`}
                  data-tip={<CustomerMessageTimeLabel conversationItem={conversationItem} />}
                >
                  {message.content}
                </p>
              </div>
              {i + 1 === conversationItem?.messages?.length && (
                <div className="flex justify-start place-items-center animate-fade animate-delay-1000 ">
                  <CustomerMessageTimeLabel conversationItem={conversationItem} />
                </div>
              )}
            </div>
          )}
          {message.sender === 'customer' && (
            <div className="flex flex-col chat chat-end">
              <div className="min-h-0 p-2 bg-gray-900 rounded-md animate-fade-left text-base-100" data-testid={`customer-message-content-${message.messageId}`}>
                {message.content}
              </div>
              {i + 1 === conversationItem?.messages?.length && (
                <div className="flex justify-end animate-duration-1000 place-items-center animate-fade">
                  {createMessageMut.isLoading ? 'Sending...' : <CustomerMessageTimeLabel conversationItem={conversationItem} />}
                </div>
              )}
            </div>
          )}
        </div>
      ))
    , [conversationItem?.messages?.length, conversationItem?.messages, conversationItem?.messages?.slice(-1)[0]?.messageId, latestFormSubmitted])

  return (
    <div
      className="flex flex-col gap-y-1 pb-8 py-2 text-sm w-full bg-base-100 dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {messageLog}
      {botTyping && <div className="flex flex-col justify-start w-full px-4 animate-fade-left gap-x-2 gap-y-1" >
        <div className="flex flex-row place-items-center gap-x-2">
          <Avatar conversationItem={conversationItem} toggleIndicator={true} />
          <p className={`justify-start p-2 rounded-md place-items-start flex-initial dark:bg-gray-600 bg-gray-100 
            } tooltip-bottom z-10`}
            data-testid={`operator-message-content-typing`}
          // data-tip={<CustomerMessageTimeLabel conversationItem={conversationItem} />}
          >
            <div className='flex items-center justify-center h-screen space-x-2 bg-white animate-pulse'>
              <span className='sr-only'>Loading...</span>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='w-8 h-8 bg-black rounded-full animate-bounce'></div>
            </div>
          </p>
        </div>
      </div>
      }
    </div >


  )
};
