import { FC, useId, useState } from 'react';
import { BsChatLeftFill, BsChevronDown, BsPencilSquare } from 'react-icons/bs';
import { WidgetPosition } from '@/entities/configuration';
import { useTranslations } from 'next-intl';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { DynamicBackground } from './DynamicBackground';

export const StartChatButton: FC = () => {
  const t = useTranslations('chat-widget');
  const [hover, setHover] = useState(false);
  const {setWidgetState, setWidgetVisibility, widgetVisibility, configuration, widgetState}  = useChatWidgetStore().chatWidget
  const {widgetPosition, enableButtonLabel, labelText  } = {...configuration?.channels?.liveChat?.appearance?.widgetAppearance};

  const handleClick = () => widgetVisibility === 'minimized' ? setWidgetVisibility('open') : setWidgetVisibility('minimized')
  
  return (
    <div className={`flex place-items-center break-keep ${widgetPosition === 'left' ? 'justify-start' : 'justify-end'}`} onClick={() => handleClick() }>
      {widgetPosition === 'left' && enableButtonLabel ? (
        <h5>{labelText}</h5>
      ) : (
        <></>
      )}
      <button
        className={`background btn btn-circle border-0  shadow-2xl`}
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
        <DynamicBackground></DynamicBackground>
        {widgetVisibility === 'minimized' && (hover ? (
          <BsPencilSquare className="text-black dark:text-white text-2xl animate-jump-in animate-once" />
        ) : (
          <BsChatLeftFill className="text-black dark:text-white text-xl animate-jump-in animate-once" />
        ))}
        {widgetVisibility === 'open' && 
          <BsChevronDown className="text-black dark:text-white text-2xl" />
        }


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
}
