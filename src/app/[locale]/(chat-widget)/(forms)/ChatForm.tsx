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
import { ChatLog } from '../../dash/inbox/OperatorChatLog';
import { CustomerChatLog } from './CustomerChatLog';
import { sendMessage } from '../actions';
import { useCustomerChatStore } from '../(actions)/useCustomerChatStore';

// export const arrangeMessage = (
//   view: SenderType,
//   message: EntityItem<typeof Message>
// ) => {
//   let align: 'start' | 'end' = 'start';
//   let messageContent = '';
//   if (view === 'customer') {
//     align = message.sender === 'operator' ? 'start' : 'end';
//     messageContent =
//       message.sender === 'operator' && !message.sentAt ? '...' : '';
//   }
//   if (view === 'operator') {
//     messageContent =
//       message.sender === 'customer' && !message.sentAt
//         ? `${message.content} ...`
//         : '';
//     align = message.sender === 'operator' ? 'end' : 'start';
//   }
//   return { align, messageContent };
// };

// export const createMessage = (
//   view: SenderType,
//   backgroundColor: string,
//   latestMessage: boolean,
//   message: EntityItem<typeof Message>,
//   { relativeTime }: ReturnType<typeof useFormatter>
// ) => {
//   const { align, messageContent } = arrangeMessage(view, message);
//   return (
//     <div className={`chat chat-${align} justify-${align}`}>
//       <div className="chat-header">
//         <time className="text-xs opacity-50">
//           {relativeTime(message.sentAt, new Date())}
//         </time>
//       </div>
//       <div
//         className={`chat-bubble ${align === 'start' && 'bg-gray-200'} ${
//           align === 'end' && backgroundColor
//         } ${!message.sentAt && 'animate-pulse'}`}
//       >
//         {messageContent}
//       </div>
//       <div className="chat-footer opacity-50">
//         {latestMessage && message.seenAt ? (
//           <time className="text-xs opacity-50">
//             {relativeTime(message.seenAt, new Date())}
//           </time>
//         ) : (
//           'Delivered'
//         )}
//       </div>
//     </div>
//   );
// };

type Inputs = {
  msg: string;
};

export const ChatForm: FC = () => {
  const { conversation, customer, operator, messages, configuration } = useCustomerChatStore();
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

  console.log(configuration?.channels?.liveChat?.appearance?.widgetAppearance)
  const {backgroundColor, darkBackgroundColor} = {...configuration?.channels?.liveChat?.appearance?.widgetAppearance}
  console.log(darkBackgroundColor)
  return (
    <div className="flex flex-col font-sans rounded-lg max-w-xl">
      <div
        className={`flex place-items-center justify-between p-2 px-6 gap-x-2 ${backgroundColor} dark:${darkBackgroundColor} border-b-2 border-gray-300 shadow-2xl`} 
      >
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
        className="flex flex-col w-full bg-white dark:bg-gray-800 border-b-2 border-gray-300 mb-4 "
        data-testid="chat-log"
      >
        <CustomerChatLog />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control">
          <div className="input-group gap-x-1">
            <div className="flex flex-col w-full">
              <input
                type="text"
                placeholder="Enter your message..."
                className="input w-full "
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
              className={`btn btn-square text-xl ${backgroundColor} dark:${darkBackgroundColor} border-0`}
              data-testid="msg-send"
              type="submit"
            >
              <IoMdSend className="text-neutral dark:text-neutral" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
