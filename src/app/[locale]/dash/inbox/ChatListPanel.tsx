'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { useState, FC } from 'react';
import { BsChatLeft } from 'react-icons/bs';
import { HiOutlineChevronDown } from 'react-icons/hi2';
import { IoMdChatbubbles } from 'react-icons/io';
import { RiChatCheckLine } from 'react-icons/ri';
import Image from 'next/image';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'operator' | 'customer';
  sentAt: string;
  editedAt: string;
  content: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

export type Customer = Operator;
export type ChatStatus = 'unassigned' | 'open' | 'solved';

export interface Chat {
  id: string;
  orgId: string;
  connectionId: string;
  status: ChatStatus;
  operators: Operator[];
  customer: Customer;
  updatedAt: string;
  createdAt: string;
  tags: string[];
  messages: Message[];
}

type Format = ReturnType<typeof useFormatter>;

export const ChatViewCard = (
  latestMessage: Message,
  profilePicture: string,
  name: string,
  format: Format
) => {
  const now = new Date();
  const { sentAt } = latestMessage;
  const messageSentAt = new Date(parseInt(sentAt, 10) * 1000);
  return (
    <div className='flex animate-in fade-in animate-out fade-out'>
      <Image
        src={profilePicture}
        alt='profile picture'
        className='h-20 w-20 rounded-full'
      />
      <div className='flex flex-col'>
        <div className='flex'>
          <h5>{name}</h5>
          <h5>{format.relativeTime(messageSentAt, now)}</h5>
        </div>
        <h5>latestMessage</h5>
      </div>
    </div>
  );
};

interface Props {
  unassignedChats: Chat[];
  openChats: Chat[];
  solvedChats: Chat[];
}
export const ChatListPanel: FC<Props> = ({
  unassignedChats = [],
  openChats = [],
  solvedChats = [],
}) => {
  const t = useTranslations();
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(false);
  const [isOpenExpanded, setIsOpenExpanded] = useState(false);
  const [isSolvedExpanded, setIsSolveExpanded] = useState(false);
  const onExpansion = 'rotate-180';
  const format = useFormatter();

  const renderChatViewCard = (chat: Chat) =>
    ChatViewCard(
      chat.messages.slice(-1)[0],
      chat.customer.profilePicture,
      chat.customer.name ?? chat.customer.email,
      format
    );

  return (
    <ul className='space-y-2 font-medium prose'>
      <li className='flex place-items-center justify-between'>
        <BsChatLeft className='h-6 text-gray-500' />
        <h5>{t('app.inbox.layout.unassigned')}</h5>
        <button
          type='submit'
          onClick={() => setIsUnassignedExpanded(!isUnassignedExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 text-primary transition-transform ${
              isUnassignedExpanded ? onExpansion : ''
            }`}
          />
        </button>
        <li>
          {isUnassignedExpanded &&
            unassignedChats.map((chat) => renderChatViewCard(chat))}
        </li>
      </li>
      <li className='flex place-items-center justify-between'>
        <IoMdChatbubbles className='h-6 text-gray-500' />
        <h5>{t('app.inbox.layout.live-chats')}</h5>
        <button
          type='submit'
          onClick={() => setIsOpenExpanded(!isOpenExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 text-primary transition-transform ${
              isOpenExpanded ? onExpansion : ''
            }`}
          />
        </button>
        <li>
          {isOpenExpanded && openChats.map((chat) => renderChatViewCard(chat))}
        </li>
      </li>
      <li className='flex place-items-center justify-between'>
        <RiChatCheckLine className='h-6 text-gray-500' />
        <h5>{t('app.inbox.layout.solved')}</h5>
        <button
          type='submit'
          onClick={() => setIsSolveExpanded(!isSolvedExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isSolvedExpanded ? onExpansion : ''
            }`}
          />
        </button>
        <li>
          {isSolvedExpanded &&
            solvedChats.map((chat) => renderChatViewCard(chat))}
        </li>
      </li>
    </ul>
  );
};
