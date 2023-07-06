import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useContext } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { CgSpinner } from 'react-icons/cg';
import { v4 as uuidv4 } from 'uuid';

import { CreateMessage } from '@/entities/entities';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useCreateMessageMut } from '../../(hooks)/mutations/useCreateMessageMut';
import { useConfigurationQuery, useOrgQuery } from '../../(hooks)/queries';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { useCustomerQuery } from '../../(hooks)/queries/useCustomerQuery';

type Inputs = {
  msg: string
}

export const OperatorChatInput: FC = () => {
  const t = useTranslations('chat-widget');
  const operatorSession = useOperatorSession();
  const { orgId } = operatorSession
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('conversationId')
  const conversationItemQuery = useConversationItemQuery(orgId, conversationId ?? '')
  const conversationItem = conversationItemQuery.data
  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }

  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', conversationId ?? '');

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
      conversationId: conversationId ?? '',
      orgId,
      customerId: customer.data?.customerId ?? '',
      operatorId: conversationItem?.conversation?.operator?.operatorId ?? '',
      content: msg,
      sentAt: Date.now(),
      sender: 'customer'
    }
    await createMessageMut.mutateAsync([orgId, conversationId ?? '', messageId ?? '', createMessage])
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      <div className="form-control">
        <div className="input-group gap-x-1">
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
            className={` btn text-xl border-0 rounded-br-lg background `}
            data-testid="msg-send"
            type="submit"
            disabled={createMessageMut.isLoading}
          >
            {createMessageMut.isLoading ?
              <CgSpinner className="text-2xl animate-spin text-base-100" />
              : <BiSend className="text-2xl" />}
          </button>
        </div>
      </div>
    </form>
  )
}