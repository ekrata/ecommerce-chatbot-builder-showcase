import { useFormatter } from 'next-intl';
import { FC } from 'react';
import Image from 'next/image';
import { useDashStore } from '../useDashStore';
import { Chat } from './Chat.type';

export const ChatListCard: FC<{ chat: Chat }> = ({ chat }) => {
  const { relativeTime } = useFormatter();
  const { setCurrentChatId } = useDashStore();
  const now = new Date();
  const {
    messages,
    customer: { name, email, profilePicture },
    read,
  } = chat;
  const { sentAt, content, typing } = messages.slice(-1)[0];
  const messageSentAt = sentAt;
  return (
    <li
      role='presentation'
      onClick={() => setCurrentChatId(chat.id)}
      className={`relative flex animate-in fade-in place-items-center gap-x-2 my-2 truncate w-full hover:bg-gray-100 hover:pointer ${
        read ? '' : 'font-bold'
      }`}
    >
      <Image
        src={profilePicture}
        alt='profile picture'
        width={60}
        height={60}
        className='p-0 mt-0 mb-2 rounded-full'
      />
      <div className='place-items-center'>
        <div className='flex gap-x-2 place-items-center'>
          <h5 className='text-lg'>{name ?? email}</h5>
          {!read && (
            <div className='badge badge-xs rounded-full badge-primary' />
          )}
          <h5>{relativeTime(messageSentAt, now)}</h5>
        </div>
        <h5 className='truncate'>
          {!typing ? content : <div className='animate-pulse  '>...</div>}
        </h5>
      </div>
    </li>
  );
};
