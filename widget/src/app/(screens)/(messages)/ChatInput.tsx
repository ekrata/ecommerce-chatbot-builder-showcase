import { useTranslations } from 'next-intl';
import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { CgSpinner } from 'react-icons/cg';
import { useCreateMessageMut } from 'src/app/(actions)/mutations/useCreateMessageMut';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import {
    useConversationItemsByCustomerQuery
} from 'src/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { v4 as uuidv4 } from 'uuid';

import { CreateMessage } from '@/entities/entities';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';

type Inputs = {
  msg: string
}

export const ChatInput: FC = () => {
  const { chatWidget: { selectedConversationId, toggleUserMessaging } } = useChatWidgetStore()
  const t = useTranslations('chat-widget');
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''

  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const widgetAppearance = configuration.data?.channels?.liveChat?.appearance
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer?.data?.customerId ?? '');
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', selectedConversationId ?? '');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
    const messageId = uuidv4()
    // if last operator message was sent by a bot, create a message with the previous message's botStateContext
    const lastMessage = conversationItem?.messages.findLast((item) => item.sender === 'bot' || item.sender === 'operator')
    const createMessage: CreateMessage = {
      messageId: messageId,
      conversationId: selectedConversationId ?? '',
      orgId,
      customerId: customer.data?.customerId ?? '',
      operatorId: conversationItem?.operator?.operatorId ?? '',
      botStateContext: lastMessage?.sender === 'bot' ? lastMessage.botStateContext : undefined,
      content: msg,
      sentAt: Date.now(),
      sender: 'customer'
    }
    await createMessageMut.mutateAsync([orgId, selectedConversationId ?? '', messageId ?? '', createMessage])
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      <div className="rounded-b-lg form-control">
        <div className="rounded-b-lg input-group">
          <div className="flex flex-col w-full rounded-b-lg">
            <input
              type="text"
              disabled={!toggleUserMessaging}
              placeholder="Enter your message..."
              autoComplete='off'
              className="w-full h-full text-xs rounded-bl-3xl focus:outline-0 active:outline-0 focus:border-0 input-sm input hover:outline-0 hover:ring-0 focus:ring-0 rounded-xs "
              data-testid="msg-input"
              {...register('msg', { required: true })}
            />
            {errors.msg && (
              <span
                className="bg-transparent text-error"
                data-testid="msg-error"
              >
                Write a message first.
              </span>
            )}
          </div>
          <button
            className={`btn text-lg border-0 rounded-br-lg`}
            data-testid="msg-send"
            type="submit"
            disabled={createMessageMut.isLoading || !toggleUserMessaging}
          >
            {createMessageMut.isLoading ?
              <CgSpinner className="text-md animate-spin text-base-100" />
              : <BiSend className="text-md" />}
            {/* {configuration.data && <DynamicBackground configuration={configuration.data} />} */}
          </button>
        </div>
      </div>
    </form>
  )
}