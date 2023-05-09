'use client';

import { useTranslations } from 'next-intl';
import { useState, FC } from 'react';
import { BsChatLeftFill } from 'react-icons/bs';
import {
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { IoMdChatbubbles } from 'react-icons/io';
import { RiChatCheckFill } from 'react-icons/ri';
import { ChatListCard } from './ChatListCard';
import { Chat, ChatStatus } from './Chat.type';

interface Props {
  unassignedChats: Chat[];
  openChats: Chat[];
  solvedChats: Chat[];
}

type Tab =
  | ChatStatus
  | 'ticket_unassigned'
  | 'ticket_open'
  | 'ticket_solved'
  | 'instagram'
  | 'facebook'
  | 'products'
  | 'order_status'
  | 'order_issues'
  | 'shipping_policy';

export const ChatListPanel: FC<Props> = ({
  unassignedChats,
  openChats,
  solvedChats,
}) => {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState<Tab>('open');
  const onExpansion = 'rotate-180';

  const renderChats = (chats: Chat[]) =>
    chats.length ? (
      chats
        .sort(
          (a, b) =>
            b.messages.slice(-1)[0].sentAt.getTime() -
            a.messages.slice(-1)[0].sentAt.getTime()
        )
        .map((chat) => <ChatListCard chat={chat} />)
    ) : (
      <div className='flex items-center mt-4 space-x-3'>
        <svg
          className='text-gray-200 w-14 h-14 dark:text-gray-700'
          aria-hidden='true'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z'
            clipRule='evenodd'
          />
        </svg>
        <div>
          <div className='h-2.5  bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2' />
          <div className='w-80 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
        </div>
      </div>
    );

  return (
    <div className='grid grid-cols-8 w-full'>
      <ul className='space-y-2 font-medium prose bg-white dark:bg-gray-800 pr-4 truncate col-span-8 lg:col-span-2'>
        <div className='divider pb-2 text-xl'>Chats</div>
        <li className='flex place-items-center justify-between w-full text-lg '>
          <BsChatLeftFill className='h-4 text-primary' />
          <h5>{t('app.inbox.layout.unassigned')}</h5>
          <button
            data-testid='expand-unassigned-chats'
            type='submit'
            onClick={() => setIsExpanded('unassigned')}
          >
            <HiOutlineChevronLeft
              className={`text-lg text-primary transition-transform ${
                isExpanded === 'unassigned' ? onExpansion : ''
              }`}
            />
          </button>
        </li>
        <li className='flex place-items-center justify-between text-lg'>
          <IoMdChatbubbles className='h-6 text-primary' />
          <h5>{t('app.inbox.layout.live-chats')}</h5>
          <button
            data-testid='expand-open-chats'
            type='submit'
            onClick={() => setIsExpanded('open')}
          >
            <HiOutlineChevronLeft
              className={`text-lg text-primary transition-transform ${
                isExpanded === 'open' ? onExpansion : ''
              }`}
            />
          </button>
        </li>
        <li className='flex place-items-center justify-between text-lg '>
          <RiChatCheckFill className='h-6 text-primary' />
          <h5>{t('app.inbox.layout.solved')}</h5>
          <button
            data-testid='expand-solved-chats'
            type='submit'
            onClick={() => setIsExpanded('solved')}
          >
            <HiOutlineChevronLeft
              className={`text-lg text-primary transition-transform ${
                isExpanded === 'solved' ? onExpansion : ''
              }`}
            />
          </button>
        </li>
        <div className='divider pt-10 pb-2 text-xl'>Tickets</div>
        <li className='flex place-items-center justify-between text-lg '>
          <RiChatCheckFill className='h-6 text-primary' />
          <h5>{t('app.inbox.layout.solved')}</h5>
          <button
            data-testid='expand-solved-chats'
            type='submit'
            onClick={() => setIsExpanded('solved')}
          >
            <HiOutlineChevronLeft
              className={`text-lg text-primary transition-transform ${
                isExpanded === 'ticket_open' ? onExpansion : ''
              }`}
            />
          </button>
        </li>
      </ul>
      <ul className='space-y-2 font-medium prose bg-white dark:bg-gray-800 pr-4 truncate col-span-8 lg:col-span-6 w-full'>
        {isExpanded === 'unassigned' && renderChats(unassignedChats)}
        {isExpanded === 'open' && renderChats(openChats)}
        {isExpanded === 'solved' && renderChats(solvedChats)}
      </ul>
    </div>
  );
};
