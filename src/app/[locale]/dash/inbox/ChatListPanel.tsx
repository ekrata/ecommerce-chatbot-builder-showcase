import { IconButton, Typography } from '@/app/mt-components';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BsChatLeft } from 'react-icons/bs';
import { HiOutlineChevronDown } from 'react-icons/hi2';
import { IoMdChatbubbles } from 'react-icons/io';
import { RiChatCheckLine } from 'react-icons/ri';

export default function ChatListPanel() {
  const t = useTranslations();
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(false);
  const [isLiveExpanded, setIsLiveExpanded] = useState(false);
  const [isSolvedExpanded, setIsSolveExpanded] = useState(false);
  const onExpansion = 'rotate-180';

  return (
    <ul className='space-y-2 font-medium'>
      <li className='flex place-items-center justify-between'>
        <BsChatLeft className='h-6 text-gray-500' />
        <Typography variant='paragraph'>
          {t('app.inbox.layout.unassigned')}
        </Typography>
        <IconButton
          variant='text'
          onClick={() => setIsUnassignedExpanded(!isUnassignedExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 text-primary transition-transform ${
              isUnassignedExpanded ? onExpansion : ''
            }`}
          />
        </IconButton>
      </li>
      <li className='flex place-items-center justify-between'>
        <IoMdChatbubbles className='h-6 text-gray-500' />
        <Typography variant='paragraph'>
          {t('app.inbox.layout.live-chats')}
        </Typography>
        <IconButton
          variant='text'
          onClick={() => setIsLiveExpanded(!isLiveExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 text-primary transition-transform ${
              isLiveExpanded ? onExpansion : ''
            }`}
          />
        </IconButton>
      </li>
      <li className='flex place-items-center justify-between'>
        <RiChatCheckLine className='h-6 text-gray-500' />
        <Typography variant='paragraph'>
          {t('app.inbox.layout.solved')}
        </Typography>
        <IconButton
          variant='text'
          onClick={() => setIsSolveExpanded(!isSolvedExpanded)}
        >
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isSolvedExpanded ? onExpansion : ''
            }`}
          />
        </IconButton>
      </li>
    </ul>
  );
}
