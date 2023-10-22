import { useTranslations } from 'next-intl';
import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { CgSpinner } from 'react-icons/cg';
import { v4 as uuidv4 } from 'uuid';

import { useCreateMessageMut } from '@/app/(actions)/mutations/useCreateMessageMut';
import { useConfigurationQuery } from '@/app/(actions)/queries/useConfigurationQuery';
import {
  useConversationItemsByCustomerQuery
} from '@/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from '@/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from '@/app/(actions)/queries/useOrgQuery';
import { CreateMessage } from '@/entities/entities';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';

type Inputs = {
  msg: string
}

export const ChatInput: FC = () => {
  const { chatWidget: { selectedConversationId } } = useChatWidgetStore()
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
    const createMessage: CreateMessage = {
      messageId: messageId,
      conversationId: selectedConversationId ?? '',
      orgId,
      customerId: customer.data?.customerId ?? '',
      operatorId: conversationItem?.operator?.operatorId ?? '',
      content: msg,
      sentAt: Date.now(),
      sender: 'customer'
    }
    await createMessageMut.mutateAsync([orgId, selectedConversationId ?? '', messageId ?? '', createMessage])
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      <div className="rounded-b-lg form-control">
        <div className="rounded-b-lg input-group gap-x-1">
          <div className="flex flex-col w-full rounded-b-lg">
            <input
              type="text"
              placeholder="Enter your message..."
              className="w-full rounded-b-lg input hover:outline-0 hover:ring-0 focus:ring-0 focus:outline-0 rounded-xs "
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
            className={`btn text-xl border-0 rounded-br-lg`}
            data-testid="msg-send"
            type="submit"
            disabled={createMessageMut.isLoading}
          >
            {createMessageMut.isLoading ?
              <CgSpinner className="text-2xl animate-spin text-base-100" />
              : <BiSend className="text-2xl" />}
            {/* {configuration.data && <DynamicBackground configuration={configuration.data} />} */}
          </button>
        </div>
      </div>
    </form>
  )
}