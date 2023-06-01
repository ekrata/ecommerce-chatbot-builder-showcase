'use client';

import { FC, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntityItem } from 'electrodb';
import { Conversation } from '@/entities/conversation';
import chatSkeleton from '../../ChatSkeleton';
import { ChatLog } from '../../OperatorChatLog';

export const CurrentChatPanel: FC = (
  conversation: EntityItem<typeof Conversation>
) => (
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
        <ChatLog chat={conversation} />
      </Suspense>
    </div>
    <div className="flex-1 bottom-0">
      <MessageBox />
    </div>
  </div>
);
