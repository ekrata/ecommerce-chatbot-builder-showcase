'use client'
import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { FC, useId, useState } from 'react';
import { BsChatLeftFill, BsChevronDown, BsPencilSquare } from 'react-icons/bs';

import { ConfigLiveChatAppearance, Configuration } from '@/entities/configuration';
import { CreateInteraction } from '@/entities/entities';
import { useQuery } from '@tanstack/react-query';

import { useCreateInteractionMut } from './(actions)/mutations/useCreateInteractionMut';
import { getConfiguration } from './(actions)/orgs/configurations/getConfiguration';
import { useCustomerQuery } from './(actions)/queries/useCustomerQuery';
import { useOrgQuery } from './(actions)/queries/useOrgQuery';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

export const StartChatButton: FC = () => {
  const t = useTranslations('chat-widget');
  const [hover, setHover] = useState(false);
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''

  const { chatWidget: { widgetState, widgetVisibility, setWidgetVisibility } } = useChatWidgetStore();
  const configuration = useQuery<EntityItem<typeof Configuration>>([orgId, 'configuration'], async () => getConfiguration(orgId));
  const customerQuery = useCustomerQuery(orgId);
  const createInteractionMut = useCreateInteractionMut(orgId);
  const widgetAppearance: ConfigLiveChatAppearance = { ...configuration.data?.channels?.liveChat?.appearance }
  const { widgetPosition, enableButtonLabel } = { ...widgetAppearance.widgetAppearance }

  const handleClick = async () => {
    if (widgetVisibility === 'minimized') {
      setWidgetVisibility('open')
      await createInteractionMut.mutateAsync([orgId, { customerId: customerQuery?.data?.customerId }])

    } else {
      setWidgetVisibility('minimized')
    }
  }

  return (
    <div onClick={() => handleClick()}>
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
          <BsPencilSquare className="text-2xl animate-jump-in animate-once" />
        ) : (
          <BsChatLeftFill className="text-xl animate-jump-in animate-once" />
        ))}
        {widgetVisibility === 'open' &&
          <BsChevronDown className="text-2xl animate-jump-in animate-once" />
        }


      </button>
      {widgetPosition === 'right' && enableButtonLabel ? (
        <div className="chat chat-start">
          <div className="flex m-1 bg-white shadow-2xl chat-bubble whitespace-nowrap bg-border-2 text-neutral">
            {t('Chat with us')}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}