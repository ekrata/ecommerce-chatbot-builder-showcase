import { FC, PropsWithChildren, useContext, useState } from 'react';
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
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { ChatWidget } from '../../ChatWidget';
import { DynamicBackground } from '../../DynamicBackground';
import { v4 as uuidv4 } from 'uuid';
import { CreateMessage } from '@/entities/entities';
import { ConversationsContext } from './MessagesScreen';

type Inputs = {
  msg: string;
};

export const ChatScreen: FC = ({}) => {
  const { chatWidget: {conversations, customer, configuration, sendMessage} } =
    useChatWidgetStore();
  const [conversationsState] = useContext(ConversationsContext);
  const {conversation, operator, messages} = conversations?.[conversationsState?.selectedConversationId ?? ''];
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
    const createMessage: CreateMessage = {
      messageId: uuidv4(),
      conversationId: conversation.conversationId,
      orgId: conversation.orgId,
      customerId: conversation.customerId,
      operatorId: conversation.operatorId,
      content: msg,
      sender: 'customer' 
    }
    const sentMessage = await sendMessage(createMessage)
    
  };

  return (
    <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
      <div
        className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
      >
        <DynamicBackground />
        <div className="avatar online">
          <div className="w-16 rounded-full ring-2 shadow-2xl">
            <Image
              src={
                operator?.profilePicture ??
                'https://www.nicepng.com/ourpic/u2y3a9e6t4o0a9w7_profile-picture-default-png/'
              }
              data-testid="operator-img"
              width={45}
              height={45}
              alt="operator picture"
            />
          </div>
        </div>
        <div className="flex flex-col justify-start">
          <div>{t('chat-with')}</div>
          <h5 className="text-2xl" data-testid="operator-title">
            {operator?.name ?? operator?.email}
          </h5>
        </div>

        <div className="flex align-end text-2xl gap-x-2">
          <BsThreeDotsVertical />
          <BsChevronDown />
        </div>
      </div>
      {/* <div
        className={` w-full ${backgroundColor} -skew-y-5 text-xl px-6 p-2 backdrop-invert font-sans`}
      >
        {t('we-reply')}
      </div> */}

      <div
        className="flex flex-col w-full bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 mb-4 "
        data-testid="chat-log"
      >
        <CustomerChatLog />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control ">
          <div className="input-group gap-x-1">
            <div className="flex flex-col w-full">
              <input
                type="text"
                placeholder="Enter your message..."
                className="input w-full rounded-xs "
                data-testid="msg-input"
                {...register('msg', { required: true })}
              />
              {errors.msg && (
                <span
                  className="text-red-600 bg-transparent"
                  data-testid="msg-error"
                >
                  Write a message first.
                </span>
              )}
            </div>
            <button
              className={`background btn btn-square  text-xl border-0`}
              data-testid="msg-send"
              type="submit"
            >
              <DynamicBackground />
              <IoMdSend className="text-neutral dark:text-white" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
