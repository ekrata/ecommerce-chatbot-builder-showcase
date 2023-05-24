'use client';

import { FC, PropsWithChildren, useId, useState } from 'react';
import { BsChatLeftFill, BsPencilSquare } from 'react-icons/bs';
import { WidgetPosition } from '@/entities/configuration';
import { useTranslations } from 'next-intl';

export type WidgetState =
  | 'online'
  | 'pre-chat survey'
  | 'operators are offline'
  | 'create ticket form'
  | 'getting started'
  | 'closed';

export const ChatWidgetCard: FC<PropsWithChildren<object>> = ({ children }) => {
  const t = useTranslations('chat-widget');
  const [hover, setHover] = useState(false);
  const [widgetState, setWidgetState] = useState<WidgetState>('online');

  return (
    <div className="flex place-items-center rounded-lg h-[10rem] w-[6rem]">
      {children}
    </div>
  );
};
