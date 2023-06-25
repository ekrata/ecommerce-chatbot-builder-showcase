import Image from 'next/image';
import { FC } from 'react';
import { useFormatter } from 'next-intl';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { Customer } from '@/entities/customer';
import { Operator } from '@/entities/operator';

export const OperatorChatLog: FC<{
  messages: EntityItem<typeof Message>[];
  customer: EntityItem<typeof Customer>;
  operator: EntityItem<typeof Operator>;
}> = ({ messages, customer, operator }) => {
  const { relativeTime } = useFormatter();
  return (
    <div
      className="flex flex-col gap-y-8 w-full overflow-y bg-white dark:bg-gray-800 mb-10 "
      data-testid="chat-log"
    >
      {messages
        .sort((a, b) => a.createdAt - b.createdAt)
        ?.map((message) => (
          <div className="px-4">
            {message.sender === 'customer' ? (
              <div className="flex place-items-center justify-start align-baseline">
                <h4 className="text-default p-2">
                  {customer.name ?? customer.email}
                </h4>
                <p className="text-xs p-2 right-0">
                  {relativeTime(message.sentAt, new Date())}
                </p>
              </div>
            ) : (
              <div className="flex place-items-center justify-end">
                <p className="text-xs p-2 right-0">
                  {relativeTime(message.sentAt, new Date())}
                </p>
              </div>
            )}
            {message.sender === 'customer' && (
              <div className="flex gap-x-2 w-full justify-start">
                <div className="w-30 h-30 flex-none">
                  <div className="indicator">
                    <span
                      data-testid="status-badge"
                      className={`indicator-item  badge-success ring-white ring-2  badge-xs text-white dark:text-default rounded-full ${
                        !message.sentAt
                          ? 'mx-0 my-0 indicator-bottom animate-bounce'
                          : 'my-2 mx-2 indicator-top'
                      }`}
                    >
                      {!message.sentAt ? '...' : ''}
                    </span>
                    <Image
                      src={customer?.profilePicture ?? ''}
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
            {message.sender === 'operator' && (
              <div className="pl-20 flex justify-end gap-x-2">
                <p className="p-2 rounded-xl bg-gray-200">{message.content}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};