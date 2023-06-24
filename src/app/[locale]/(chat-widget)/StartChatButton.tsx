import { FC, useId, useState } from 'react';
import { BsChatLeftFill, BsChevronDown, BsPencilSquare } from 'react-icons/bs';
import { Configuration, WidgetPosition } from '@/entities/configuration';
import { useTranslations } from 'next-intl';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { DynamicBackground } from './DynamicBackground';
import { useQuery } from '@tanstack/react-query';
import { EntityItem } from 'electrodb';
import { getConfiguration } from './(actions)/orgs/configurations/getConfiguration';

export const StartChatButton: FC = () => {
  const t = useTranslations('chat-widget');
  const [hover, setHover] = useState(false);
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const {chatWidget: { widgetState, widgetVisibility, setWidgetVisibility}} = useChatWidgetStore();
  const configuration = useQuery<EntityItem<typeof Configuration>>([orgId, 'configuration'], async () => getConfiguration(orgId));
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const { widgetPosition, enableButtonLabel,  } = {...widgetAppearance }
  const handleClick = () => widgetVisibility === 'minimized' ? setWidgetVisibility('open') : setWidgetVisibility('minimized')
  
  return (
    <div className={`flex place-items-center break-keep ${widgetPosition === 'left' ? 'justify-start' : 'justify-end'}`} onClick={() => handleClick() }>
      {widgetPosition === 'left' && enableButtonLabel ? (
        <h5>{t('Chat with us')}</h5>
      ) : (
        <></>
      )}
      <button
        className={` btn btn-circle border-0  shadow-2xl`}
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
        {widgetVisibility === 'minimized' && (hover ? (
          <BsPencilSquare className=" text-2xl animate-jump-in animate-once" />
        ) : (
          <BsChatLeftFill className=" text-xl animate-jump-in animate-once" />
        ))}
        {widgetVisibility === 'open' && 
          <BsChevronDown className=" text-2xl animate-jump-in animate-once" />
        }


      </button>
      {widgetPosition === 'right' && enableButtonLabel ? (
        <div className="chat chat-start">
          <div className="chat-bubble whitespace-nowrap flex m-1 bg-white bg-border-2  text-neutral shadow-2xl">
            {t('Chat with us')}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
