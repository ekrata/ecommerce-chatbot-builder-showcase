import { FC, PropsWithChildren, useState } from 'react';
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
import { ChatLog } from '../../../dash/inbox/OperatorChatLog';
import { CustomerChatLog } from '../CustomerChatLog';
import { sendMessage } from '../../actions';
import { useCustomerChatStore } from '../../(actions)/useCustomerChatStore';
import { ChatWidget } from '../../ChatWidget';

type Inputs = {
  msg: string;
};

export const HomeScreen: FC = () => {
  const { conversation, customer, operator, messages, configuration } =
    useCustomerChatStore();
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
    const sentMessage = await sendMessage(
      conversation?.orgId ?? '',
      conversation?.conversationId ?? '',
      customer?.customerId ?? '',
      operator?.operatorId ?? '',
      'customer',
      msg
    );
    useCustomerChatStore.setState({
      ...useCustomerChatStore.getState(),
      messages: [...(messages ?? []), sentMessage],
    });
  };

  console.log(configuration?.channels?.liveChat?.appearance?.widgetAppearance);
  const { backgroundColor, darkBackgroundColor } = {
    ...configuration?.channels?.liveChat?.appearance?.widgetAppearance,
  };
  console.log(darkBackgroundColor);
  const background = `
    .background {
      background: ${backgroundColor}
    }
    .dark-mode .background {
      background: ${darkBackgroundColor}
    }
      
  `;
  return (
    <div className="flex flex-col font-sans rounded-lg max-w-xl dark:bg-gray-800">
      <div
        className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
      >
        <style>{background}</style>
      </div>
    </div>
  );
};
