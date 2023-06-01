import Image from 'next/image';
import { FC } from 'react';
import { useFormatter } from 'next-intl';
import { useCustomerChatStore } from '../(actions)/useCustomerChatStore';

export const CustomerChatLog: FC = () => {
  const { relativeTime } = useFormatter();
  const { messages, operator } = useCustomerChatStore();
  return (
    <div
      className="flex flex-col gap-y-8 pb-8 w-full bg-white dark:bg-gray-800 overflow-y-scroll h-[30rem]"
      data-testid="chat-log"
    >
      {messages
        ?.sort((a, b) => a?.sentAt - b?.sentAt)
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
                  className={`text-default p-2 rounded-xl flex-initial bg-gray-100 ${
                    !message.sentAt && 'animate-pulse'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="pl-20 flex justify-end gap-x-2">
                <p className="p-2 rounded-xl bg-gray-200">{message.content}</p>
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
