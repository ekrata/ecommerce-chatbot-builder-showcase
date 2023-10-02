import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useContext } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { CgSpinner } from 'react-icons/cg';
import { v4 as uuidv4 } from 'uuid';

import { ConversationItem } from '@/entities/conversation';
import { CreateMessage } from '@/entities/entities';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useCreateMessageMut } from '../../(hooks)/mutations/useCreateMessageMut';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';

type Inputs = {
  msg: string
}

interface Props {
  conversationItem?: ConversationItem
}

export const OperatorChatInput: FC<Props> = ({ conversationItem }) => {
  const t = useTranslations('chat-widget');
  const [operatorSession] = useAuthContext();
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('conversationId')


  const createMessageMut = useCreateMessageMut(operatorSession?.orgId ?? '', conversationItem?.customer?.customerId ?? '', conversationId ?? '');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({ msg }) => {
    const messageId = uuidv4()
    console.log(conversationItem)
    const createMessage: CreateMessage = {
      messageId: messageId,
      conversationId: conversationId ?? '',
      orgId: operatorSession?.orgId ?? '',
      customerId: conversationItem?.customer?.customerId ?? '',
      operatorId: conversationItem?.operator?.operatorId ?? '',
      content: msg,
      sentAt: Date.now(),
      sender: 'operator'
    }
    console.log(createMessage)
    await createMessageMut.mutateAsync([operatorSession?.orgId ?? '', conversationId ?? '', messageId ?? '', createMessage])
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full border-t-[1px] bg-white '>
      <div className="shadow-2xl form-control">
        <div className="flex ">
          <div className="flex flex-col w-full pt-2 pb-2 pl-2 ">
            <textarea
              placeholder="Enter your message..."
              className="bg-gray-200 rounded-r-none textarea textarea-ghost text-areaw-full rounded-l-md input hover:outline-0 hover:ring-0 focus:ring-0 focus:outline-0 "
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
            className={`flex mt-2 mb-2 mr-2 rounded-r-md rounded-none btn   border-0 align-center h-full   bg-black`}
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