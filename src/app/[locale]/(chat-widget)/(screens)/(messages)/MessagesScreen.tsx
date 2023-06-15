import { Dispatch, FC, PropsWithChildren, createContext, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { EntityItem } from 'electrodb';
import { Message, SenderType } from '@/entities/message';
import { Operator } from '@/entities/operator';
import Image from 'next/image';
import { Customer } from '@/entities/customer';
import { FaWindowMinimize } from 'react-icons/fa';
import { BsChevronDown, BsThreeDotsVertical } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { Conversation } from '@/entities/conversation';
import { Api } from 'sst/node/api';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CustomerChatLog } from './CustomerChatLog';
import { ChatWidget } from '../../ChatWidget';
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
  const { chatWidget: {conversations, configuration} } = useChatWidgetStore();
  const [conversationsState, setConversationsState] = useState<ConversationsState>({})
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <ConversationsContext.Provider value={[conversationsState, setConversationsState]}>
      <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
        <div
          className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
        >
          {!conversationsState.selectedConversationId ?
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
