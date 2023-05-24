import { PropsWithChildren } from 'react';

export const ChatWidgetCard: FC<PropsWithChildren<object>> = () => {
  const t = useTranslations('chat-widget');

  return (
    <div className="flex place-items-center rounded-lg h-[10rem] w-[6rem]">
      {children}
    </div>
  );
};
