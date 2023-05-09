'use client';

import { FC, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatLog } from './ChatLog';
import MessageBox from './MessageBox';
import chatSkeleton from './ChatSkeleton';

export const CurrentChatPanel: FC = () => {
  const { chat } = useSearchParams();
  const chats = useChat();

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-800"
      data-testid="current-chat-panel"
    >
      <div className="flex-grow">
        <Suspense
          fallback={Array(20).map(() => (
            <>{chatSkeleton('left')}</>
          ))}
        >
          <ChatLog chat={chat} />
        </Suspense>
      </div>
      <div className="flex-1 bottom-0">
        <MessageBox />
      </div>
    </div>
  );
};
