'use client';

import { useTranslations } from 'next-intl';
import ChatListPanel from './ChatListPanel';
import ChatPanel from './ChatPanel';
import ChatInfoPanel from './ChatInfoPanel';
import { useDashStore } from '../useDashStore';

export default function Page() {
  useDashStore((state) => state.setCurrentFeature('inbox'));
  return (
    <>
      <div
        id='inbox-page'
        className=' z-0 w-64 h-screen transition-transform lg:grid grid-cols-12'
        aria-label='Inbox'
      >
        <div className='h-full px-3 py-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 shadow-xl grid-cols-3'>
          <ChatListPanel />
        </div>
        <section className='grid-cols-5'>
          <ChatPanel />
        </section>
        <section className='grid-cols-4 flex-col flex'>
          <ChatInfoPanel />
        </section>
      </div>
    </>
  );
}
