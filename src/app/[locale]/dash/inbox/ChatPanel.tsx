'use client';

import { Suspense } from 'react';
import { Chat, ChatDetailView } from './ChatListPanel';
import ChatLog from './ChatLog';
import MessageBox from './MessageBox';
import chatSkeleton from './ChatSkeleton';

export default function ChatListPanel(chat: ChatDetailView) {
  // t = useTranslations('layout');

  return (
    <div className='flex flex-col'>
      <div className='flex-grow'>
        <Suspense
          fallback={Array(20).map(() => (
            <>{chatSkeleton('left')}</>
          ))}
        >
          <ChatLog chat={chat} />
        </Suspense>
      </div>
      <div className='flex-1 bottom-0'>
        <MessageBox />
      </div>
    </div>
  );
}
