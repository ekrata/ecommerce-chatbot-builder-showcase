import { FC, PropsWithChildren } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { EntityItem } from 'electrodb';
import { Message, SenderType } from '@/entities/message';
import { Operator } from '@/entities/operator';
import Image from 'next/image';
import { Customer } from '@/entities/customer';

export const arrangeMessage = (
  view: SenderType,
  message: EntityItem<typeof Message>
) => {
  let align: 'start' | 'end' = 'start';
  let messageContent = '';
  if (view === 'customer') {
    align = message.sender === 'operator' ? 'start' : 'end';
    messageContent =
      message.sender === 'operator' && message.typing ? '...' : '';
  }
  if (view === 'operator') {
    messageContent =
      message.sender === 'customer' && message.typing
        ? `${message.content} ...`
        : '';
    align = message.sender === 'operator' ? 'end' : 'start';
  }
  return { align, messageContent };
};

export const createMessage = (
  view: SenderType,
  backgroundColor: string,
  latestMessage: boolean,
  message: EntityItem<typeof Message>,
  { relativeTime }: ReturnType<typeof useFormatter>
) => {
  const { align, messageContent } = arrangeMessage(view, message);
  return (
    <div className={`chat chat-${align}`}>
      <div className="chat-header">
        <time className="text-xs opacity-50">
          {relativeTime(message.sentAt, new Date())}
        </time>
      </div>
      <div
        className={`chat-bubble ${align === 'end' && backgroundColor} ${
          message.typing && 'animate-pulse'
        }`}
      >
        {messageContent}
      </div>
      <div className="chat-footer opacity-50">
        {latestMessage && message.seenAt ? (
          <time className="text-xs opacity-50">
            {relativeTime(message.seenAt, new Date())}
          </time>
        ) : (
          'Delivered'
        )}
      </div>
    </div>
  );
};

export const ChatWidgetCard: FC<
  PropsWithChildren<{
    backgroundColor: string;
    messages: EntityItem<typeof Message>[];
    customer: EntityItem<typeof Customer>;
    operator: EntityItem<typeof Operator>;
  }>
> = ({ backgroundColor, messages, customer, operator, children }) => {
  const t = useTranslations('chat-widget');
  const formatter = useFormatter();
  return (
    <div className="flex flex-col place-items-center rounded-lg h-[10rem] w-[6rem]">
      <div className={`${backgroundColor}`}>
        <div className="avatar online">
          <div className="w-24 rounded-full">
            <Image
              src={
                operator?.profilePicture ??
                'https://www.nicepng.com/ourpic/u2y3a9e6t4o0a9w7_profile-picture-default-png/'
              }
              alt="operator picture"
            />
          </div>
        </div>
      </div>
      ``
      <div>
        <div
          className="flex flex-col gap-y-8 w-full overflow-y bg-white dark:bg-gray-800 mb-10 "
          data-testid="chat-log"
        >
          {messages
            .sort(
              (a, b) =>
                new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            )
            ?.map((message, i) =>
              message.sender === 'operator'
                ? createMessage(
                    'customer',
                    'bg-gray-100',
                    i === messages.length,
                    message,
                    formatter
                  )
                : createMessage(
                    'customer',
                    backgroundColor,
                    i === messages.length,
                    message,
                    formatter
                  )
            )}
        </div>
      </div>
      <div />
    </div>
  );
};
