import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import {ChatListPanel} from './ChatListPanel';
import ChatPanel from './ChatPanel';
import ChatInfoPanel from './ChatInfoPanel';
import ChatSkeleton from './ChatSkeleton';
import chatSkeleton from './ChatSkeleton';

export default async function Page() {
  // useDashStore((state) => state.setCurrentFeature('inbox'));

  return (
    <>
      <div
        id='inbox-page'
        className=' z-0 w-screen h-screen transition-transform lg:grid lg:grid-cols-12'
        aria-label='Inbox'
      >
        <div className='h-full px-2 py-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 shadow-xl col-span-12 lg:col-span-2 w-full'>
          <Suspense
            fallback={Array(20).map((i) => (
              <>{chatSkeleton(i % 2 === 0 ? 'left' : 'right')}</>
            ))}
          >
            <ChatListPanel
              unassignedChats={[]}
              openChats={[]}
              solvedChats={[]}
            />
          </Suspense>
        </div>
        <section className='grid-cols-5 lg:col-span-6'>
          <Suspense
            fallback={Array(20).map((i) => (
              <>{chatSkeleton(i % 2 === 0 ? 'left' : 'right')}</>
            ))}
              <ChatPanel />
          </Suspense>
        </section>
        <section className='grid-cols-4 lg:col-span-4 flex-col flex'>
          <ChatInfoPanel />
        </section>
      </div>
    </>
  );
}
