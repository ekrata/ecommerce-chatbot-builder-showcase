import {
  Dispatch,
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
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
import { ConversationsScreen } from './(screens)/(messages)/ConversationsScreen';
import { Org } from '@/entities/org';
import { getOrg } from './(actions)/orgs/getOrg';
import { Customer } from '@/entities/customer';
import { useQuery } from '@tanstack/react-query';
import { Configuration } from '@/entities/configuration';
import { useConfigurationQuery, useCustomerQuery, useOrgQuery } from './(hooks)/queries';
import { ChatScreen } from './(screens)/(messages)/ChatScreen';

export interface ConversationsState {
  selectedConversationId?: string
}

export const ConversationsContext = createContext<[ConversationsState?, Dispatch<ConversationsState>?]>([]);

export const ChatWidget: FC<PropsWithChildren<{ mockWsUrl?: string }>> = ({
  children,
  mockWsUrl,
}) => {
  const { chatWidget: {widgetVisibility, widgetState } } =
    useChatWidgetStore();
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const org = useOrgQuery(orgId)
  const customer = useCustomerQuery(orgId, '')
  const [conversationsState, setConversationsState] = useState<ConversationsState>({})


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
      case 'chat':
      case 'messages': {
        return (
          <>
            {widgetState === 'chat' && (<><ChatScreen /></>)}
            {widgetState === 'messages' && (<><ConversationsScreen /><NavBar /></>)}
          </>
        )
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
    <div className={`${widgetAppearance?.widgetPosition === 'left' ? 'md:absolute md:left-20 md:bottom-20' : 'md:absolute md:right-20 md:bottom-20'}`}>
        {widgetVisibility === 'open' &&
        (
          <div className="flex flex-col h-full w-full md:w-[27rem] md:h-[40rem] rounded-xl max-w-xl dark:bg-gray-900 bg-white animate-fade-left overflow-y-scroll mb-20">
            {content}
          </div>
          )}
          <div className='mt-10' >
            <StartChatButton></StartChatButton>
          </div>
    </div>
  );
};
