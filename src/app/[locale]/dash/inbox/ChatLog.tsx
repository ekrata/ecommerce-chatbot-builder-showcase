import Image from 'next/image';
import { FC } from 'react';
import { Chat } from './Chat.type';

export const ChatLog: FC<{ chat: Chat }> = ({ chat }) => {
  const {
    messages,
    customer: { profilePicture },
  } = chat;

  return (
    <div
      className='flex flex-col gap-y-8 w-full overflow-y bg-white dark:bg-gray-800 '
      data-testid='chat-log'
    >
      {messages?.map((message) => (
        <div className='w-full px-4  prose'>
          {message.senderType === 'customer' && (
            <div className='left-0  inline-flex gap-x-2'>
              <Image
                src={profilePicture}
                alt='profile-picture'
                width={60}
                height={60}
                className='object-contain rounded-full'
              />
              <p className='text-default p-2 rounded-xl bg-gray-100'>
                {message.content}
              </p>
            </div>
          )}
          {message.senderType === 'operator' && (
            <div className='right-0  inline-flex gap-x-2'>
              <p className=' p-2 rounded-xl bg-gray-300'>{message.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
