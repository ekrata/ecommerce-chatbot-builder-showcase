import Image from 'next/image';
import { Chat } from './ChatListPanel';

export default (chat: Chat) => {
  const { messages, profilePicture } = chat;
  return (
    <div className='flex overflow-y gap-y-2'>
      {messages?.map((message) => (
        <div className='w-full px-4 flex align-center place-items-center'>
          <Image
            src={profilePicture}
            alt='profile-picture'
            className='rounded-full px-1'
          />
          {message.content}
        </div>
      ))}
    </div>
  );
};
