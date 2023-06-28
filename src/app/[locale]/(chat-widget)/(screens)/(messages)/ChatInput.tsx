import { FC, useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useCreateConversationMut, useCreateMessageMut } from "../../(hooks)/mutations";
import { useTranslations } from "next-intl";
import { CreateMessage } from "@/entities/entities";
import { useOrgQuery,  useConfigurationQuery, useConversationItemsQuery } from "../../(hooks)/queries";
import {v4 as uuidv4} from 'uuid'
import { BiSend } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { DynamicBackground } from "../../DynamicBackground";
import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { getItem } from "../../(helpers)/helpers";
import { useCustomerQuery } from "../../(hooks)/queries/useCustomerQuery";

type Inputs = {
  msg: string 
}

export const ChatInput: FC = () => {
  const {chatWidget: {selectedConversationId}} = useChatWidgetStore()
  const t = useTranslations('chat-widget');
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const org = useOrgQuery(orgId);
  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  const conversationItems = useConversationItemsQuery(orgId, customer?.data?.customerId ?? '')
  const conversationItem = getItem(conversationItems.data ?? [], selectedConversationId ?? '');
  const createMessageMut = useCreateMessageMut(orgId, customer?.data?.customerId ?? '', selectedConversationId ?? '' )
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
        operatorId: conversationItem?.conversation?.operator?.operatorId ?? '',
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
            className={` btn text-xl border-0 rounded-br-lg background `}
            data-testid="msg-send"
            type="submit"
            disabled={createMessageMut.isLoading}
          >
            {createMessageMut.isLoading ? 
            <CgSpinner className="text-2xl animate-spin text-base-100" />
            : <BiSend className="text-2xl" />}
            {configuration.data && <DynamicBackground configuration={configuration.data} />}
          </button>
        </div>
      </div>
    </form>
  )
}