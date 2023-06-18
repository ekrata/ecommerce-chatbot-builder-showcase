import { Dispatch, FC, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import {  useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { MessageCard } from './MessageCard';
import { ChatScreen } from './ChatScreen';

export interface ConversationsState {
  selectedConversationId?: string
}


export const ConversationsContext = createContext<[ConversationsState?, Dispatch<ConversationsState>?]>([]);

type Inputs = {
  msg: string;
};

export const MessagesScreen: FC = () => {
  const { chatWidget: {conversations, loading, configuration, fetchConversationItems} } = useChatWidgetStore();
  const [conversationsState, setConversationsState] = useState<ConversationsState>({})
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    fetchConversationItems()
    console.log(conversations)
  }, [])


  return (
    <ConversationsContext.Provider value={[conversationsState, setConversationsState]}>
      <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
        <div
          className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
        >
          {loading && (
            <>
              <MessageCard />
              <MessageCard />
            </>
          )
          } 
          {!loading && !conversationsState.selectedConversationId ?
            Object.entries(conversations).map(([_,conversation]) => (
              <MessageCard conversation={conversation}/>
            )) :  
              <ChatScreen></ChatScreen>  
            }

        </div>
      </div>
    </ConversationsContext.Provider>
  );
};
