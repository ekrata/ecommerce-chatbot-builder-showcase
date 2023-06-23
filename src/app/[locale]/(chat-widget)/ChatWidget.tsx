import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { StartChatButton } from './StartChatButton';
import { NavBar } from './NavBar';
import { HomeScreen } from './(screens)/HomeScreen';
import { HelpScreen } from './(screens)/HelpScreen';
import { EntityItem } from 'electrodb';
import { MessagesScreen } from './(screens)/(messages)/MessagesScreen';
import { Org } from '@/entities/org';
import { getOrg } from './(actions)/orgs/getOrg';
import { Customer } from '@/entities/customer';
import { useQuery } from '@tanstack/react-query';
import { Configuration } from '@/entities/configuration';

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { chatWidget: {widgetVisibility, widgetState } } =
    useChatWidgetStore();

  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const org = useQuery<EntityItem<typeof Org>>('org', async () => getOrg(orgId ?? ''));
  const configuration = useQuery<EntityItem<typeof Configuration>>([orgId, 'configuration']);

  // only load from persistence.
  const customer = useQuery<EntityItem<typeof Customer>>([orgId, 'customer']);
  const { widgetPosition } = {...configuration.data?.channels?.liveChat?.appearance?.widgetAppearance}

  const content = useMemo(() => {
    switch (widgetState) {
      case 'home': {
        return (
          <div className='flex flex-col'>
            <HomeScreen />
            <NavBar />
          </div>
        );
      }
      case 'chat': {
        return (
          <>
            <MessagesScreen />
          </>
        )
      }
      case 'messages': {
        return (
          <div className=''>
            <MessagesScreen />
            <NavBar />
          </div>
        );
      }
      case 'help': {
        return (
          <>
            <HelpScreen />
            <NavBar />
          </>
        );
      }
    }
  }, [widgetState])

  return (
    <div className={`${widgetPosition === 'left' ? 'md:absolute md:left-20 md:bottom-20' : 'md:absolute md:right-20 md:bottom-20'}`}>
        {widgetVisibility === 'open' &&
        (
          <div className="flex flex-col font-sans h-full w-full md:w-[27rem] md:h-[40rem] rounded-xl max-w-xl dark:bg-gray-900 bg-white animate-fade-up">
            {content}
          </div>
          )}
          <div className='mt-10' >
            <StartChatButton></StartChatButton>
          </div>
    </div>
  );
};
