'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { useState, FC } from 'react';
import { BsChatLeft, BsChatLeftFill } from 'react-icons/bs';
import { HiOutlineChevronDown } from 'react-icons/hi2';
import { IoMdChatbubbles } from 'react-icons/io';
import { RiChatCheckFill, RiChatCheckLine } from 'react-icons/ri';
import { ChatListCard } from './ChatListCard';
import { Chat } from './Chat.type';

interface Props {
  unassignedChats: Chat[];
  openChats: Chat[];
  solvedChats: Chat[];
}
export const ChatListPanel: FC<Props> = ({
  unassignedChats,
  openChats,
  solvedChats,
}) => {
  const t = useTranslations();
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(false);
  const [isOpenExpanded, setIsOpenExpanded] = useState(false);
  const [isSolvedExpanded, setIsSolveExpanded] = useState(false);
  const onExpansion = 'rotate-180';

  return (
    <ul className='space-y-2 font-medium prose bg-white dark:bg-gray-800 pr-4 truncate'>
      <li className='flex place-items-center justify-between w-full text-lg '>
        <BsChatLeftFill className='h-6 text-primary' />
        <h5>{t('app.inbox.layout.unassigned')}</h5>
        <button
          data-testid='expand-unassigned-chats'
          type='submit'
          onClick={() => setIsUnassignedExpanded(!isUnassignedExpanded)}
        >
          <HiOutlineChevronDown
            className={`text-lg text-primary transition-transform ${
              isUnassignedExpanded ? onExpansion : ''
            }`}
          />
        </button>
      </li>
      <ul data-testid='unassigned-chats'>
        {isUnassignedExpanded &&
          unassignedChats
            .sort(
              (a, b) =>
                b.messages.slice(-1)[0].sentAt.getTime() -
                a.messages.slice(-1)[0].sentAt.getTime()
            )
            .map((chat) => <ChatListCard chat={chat} />)}
      </ul>
      <li className='flex place-items-center justify-between text-lg'>
        <IoMdChatbubbles className='h-6 text-primary' />
        <h5>{t('app.inbox.layout.live-chats')}</h5>
        <button
          data-testid='expand-open-chats'
          type='submit'
          onClick={() => setIsOpenExpanded(!isOpenExpanded)}
        >
          <HiOutlineChevronDown
            className={`text-lg text-primary transition-transform ${
              isOpenExpanded ? onExpansion : ''
            }`}
          />
        </button>
      </li>
      <ul data-testid='open-chats'>
        {isOpenExpanded &&
          openChats
            .sort(
              (a, b) =>
                b.messages.slice(-1)[0].sentAt.getTime() -
                a.messages.slice(-1)[0].sentAt.getTime()
            )
            .map((chat) => <ChatListCard chat={chat} />)}
      </ul>
      <li className='flex place-items-center justify-between text-lg '>
        <RiChatCheckFill className='h-6 text-primary' />
        <h5>{t('app.inbox.layout.solved')}</h5>
        <button
          data-testid='expand-solved-chats'
          type='submit'
          onClick={() => setIsSolveExpanded(!isSolvedExpanded)}
        >
          <HiOutlineChevronDown
            className={`text-lg text-primary transition-transform ${
              isSolvedExpanded ? onExpansion : ''
            }`}
          />
        </button>
      </li>
      <ul data-testid='solved-chats'>
        {isSolvedExpanded &&
          solvedChats
            .sort(
              (a, b) =>
                b.messages.slice(-1)[0].sentAt.getTime() -
                a.messages.slice(-1)[0].sentAt.getTime()
            )
            .map((chat) => <ChatListCard chat={chat} />)}
      </ul>
    </ul>
  );
};
