import Image from 'next/image';
import { FC, useContext } from 'react';
import { useFormatter } from 'next-intl';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { ConversationsContext } from './MessagesScreen';

interface Props  {
  conversationId: string
}

/**
 * Renders a chat log from the perspective of a customer, in the chat widget.
 * @date 13/06/2023 - 12:09:16
 *
 * @param {{ conversationId: string; }} {conversationId}
 * @returns {*}
 */
export const CustomerChatLog: FC = ({}) => 
{ const { relativeTime } = useFormatter();
  const [conversationState, setConversationsState] = useContext(ConversationsContext);
  const {chatWidget: {conversations}} = useChatWidgetStore();
  const {messages, operator, conversation } = conversations[conversationState?.selectedConversationId ?? ''];
  return (
    <div
      className="flex flex-col gap-y-8 pb-8 w-full bg-white dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {messages
        ?.sort((a, b) => (a?.sentAt ?? 0) - (b?.sentAt ?? 0))
        ?.map((message) => (
          <div className="px-4">
            {message.sender === 'operator' ? (
              <div className="flex place-items-center justify-start ">
                <h4 className="text-default p-2">
                  {operator?.name ?? operator?.email}
                </h4>
                <p className="text-xs p-2 right-0">
                  {message?.sentAt && relativeTime(message?.sentAt, new Date())}
                </p>
              </div>
            ) : (
              <div className="flex place-items-center justify-end">
                <p className="text-xs p-2 right-0">
                  {message?.sentAt && relativeTime(message?.sentAt, new Date())}
                </p>
              </div>
            )}
            {message.sender === 'operator' && (
              <div className="flex gap-x-2 w-full justify-start">
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
                    <Image
                      src={operator?.profilePicture ?? ''}
                      alt="profile-picture"
                      width={50}
                      height={50}
                      className="rounded-full ring-2 m-0 p-0 "
                    />
                  </div>
                </div>
                <p
                  className={`text-default p-2 rounded-xl flex-initial dark:bg-gray-600 bg-gray-100 ${
                    !message.sentAt && 'animate-pulse'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="pl-20 flex justify-end gap-x-2">
                <p className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700">
                  {message.content}
                </p>
              </div>
            )}
            {message.sender === 'context' && (
              <div className="flex justify-center gap-x-2">
                <p className="p-2 rounded-xl text-xs text-base-200">
                  {message.content}
                </p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
