import { FC, useContext } from 'react';
import {  useTranslations } from 'next-intl';
import Image from 'next/image';
import { BsChevronDown, BsThreeDotsVertical } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CustomerChatLog } from './CustomerChatLog';
import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { DynamicBackground } from '../../DynamicBackground';
import { v4 as uuidv4 } from 'uuid';
import { CreateMessage } from '@/entities/entities';
import { ConversationsContext } from './MessagesScreen';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { EntityItem } from 'electrodb';
import { Org } from '@/entities/org';
import { Customer } from '@/entities/customer';
import { Article } from '@/entities/article';
import { ConversationItem } from '@/entities/conversation';
import { getConversationItems } from '../../(actions)/conversations/getConversationItems';
import { getOrg } from '../../(actions)/orgs/getOrg';
import { getArticles } from '../../(actions)/orgs/articles/getArticles';
import { Configuration } from '@/entities/configuration';

type Inputs = {
  msg: string;
};

export const ChatScreen: FC = ({}) => {
  const { chatWidget: {widgetState,  setWidgetState} } =
    useChatWidgetStore();
  const [conversationsState] = useContext(ConversationsContext);
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const org = useQuery<EntityItem<typeof Org>>([orgId, 'org'], async () => getOrg(orgId));
  const customer = useQuery<EntityItem<typeof Customer>>([orgId, 'customer'])
  const conversationItems = useQuery<ConversationItem[]>([orgId, 'conversationItems'], async () => {
    if(orgId && customer?.data?.customerId) {
      return await getConversationItems(orgId, customer?.data.customerId)
    }
    return []
  });
  const mostRecentConversationItem = conversationItems?.data?.slice(-1)[0]
  const configuration = useQuery<EntityItem<typeof Configuration>>([org.data?.orgId, 'configuration'], async () => getConfiguration(process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''));
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
    if(conversation?.conversationId && conversation.customer.customerId) {
      const createMessage: CreateMessage = {
        messageId: uuidv4(),
        conversationId: conversation?.conversationId,
        orgId: conversation?.orgId,
        customerId: conversation?.customer.customerId,
        operatorId: conversation?.operator.operatorId ?? '',
        content: msg,
        sender: 'customer' 
      }
      // const sentMessage = await sendMessage(createMessage)
    }
  };

  return (
    <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
      <div
        className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
      >
        {configuration.data && <DynamicBackground configuration={configuration.data} />}
        <div className="avatar online">
          <div className="w-16 rounded-full ring-2 shadow-2xl">
            <Image
              src={
                conversation?.operator?.profilePicture ??
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
          <div>{t('Chat with')}</div>
          <h5 className="text-2xl" data-testid="operator-title">
            {conversation?.operator?.name ?? conversation?.operator?.email}
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
              {configuration.data && <DynamicBackground configuration={configuration.data} />}
              <IoMdSend className="text-neutral dark:text-white" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
