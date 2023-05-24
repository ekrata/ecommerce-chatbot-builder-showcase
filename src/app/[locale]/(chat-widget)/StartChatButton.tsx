'use client';

import { FC, useId, useState } from 'react';
import { BsChatLeftFill, BsPencilSquare } from 'react-icons/bs';
import { WidgetPosition } from '@/entities/configuration';
import { useTranslations } from 'next-intl';

export const StartChatButton: FC<{
  enableButtonLabel: boolean;
  widgetPosition: WidgetPosition;
  startChatLabel: string;
  backgroundColor: string;
}> = ({
  enableButtonLabel,
  widgetPosition,
  startChatLabel,
  backgroundColor,
}) => {
  const t = useTranslations('chat-widget');
  const [hover, setHover] = useState(false);

  return (
    <div className="flex place-items-center break-keep">
      {widgetPosition === 'left' && enableButtonLabel ? (
        <h5>{startChatLabel}</h5>
      ) : (
        <></>
      )}
      <button
        className={`btn btn-circle border-0 ${backgroundColor} shadow-2xl`}
        type="submit"
        id={useId()}
        data-testid="start-chat-btn"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        {hover ? (
          <BsPencilSquare className="text-black dark:text-white text-2xl animate-in zoom-in animate-out zoom-out" />
        ) : (
          <BsChatLeftFill className="text-black dark:text-white text-xl animate-in zoom-in animate-out zoom-out" />
        )}
      </button>
      {widgetPosition === 'right' && enableButtonLabel ? (
        <div className="chat chat-start">
          <div className="chat-bubble whitespace-nowrap flex m-1 bg-gray-100 dark:bg-gray-900 text-neutral shadow-2xl">
            {t('start-chat-cta')}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
