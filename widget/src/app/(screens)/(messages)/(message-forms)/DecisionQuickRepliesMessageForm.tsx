import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { BiLoaderAlt, BiSend } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { FcCheckmark } from 'react-icons/fc';
import { useUpdateMessageMut } from 'src/app/(actions)/mutations/useUpdateMessageMut';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { useOnClickOutside } from 'usehooks-ts';
import * as z from 'zod';

import { Message } from '@/entities/message';
import {
  DecisionQuickRepliesData
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionQuickReplies';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  content: z.string()?.min(1, { message: 'Required' })
})

interface Props {
  message: EntityItem<typeof Message>
  formSubmittedState?: [boolean, Dispatch<SetStateAction<boolean>>]
}

type FormResponse = z.infer<typeof schema>

export const DecisionQuickRepliesMessageForm: React.FC<Props> = ({ message, formSubmittedState }) => {
  const [_, setLatestedFormSubmitted] = formSubmittedState ?? []
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const tWidget = useTranslations('chat-widget')

  const orgQuery = useOrgQuery()
  const orgId = orgQuery?.data?.orgId ?? ''
  const messageFormData = JSON.parse(message?.messageFormData ?? '{}') as DecisionQuickRepliesData
  console.log(messageFormData)
  const quickReplies = messageFormData?.["quickReplies"]
  console.log(quickReplies)


  // const [schema, setSchema] = useState<any>(emailSchema);
  const [placeholder, setPlaceholder] = useState<any>('emailInputPlaceholder ');
  // const [nodes, setNodes, onNodesChange] = useNodeContext()
  const updateMessageMut = useUpdateMessageMut(message?.orgId, message?.conversationId, message?.messageId);
  // const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)
  const [selection, setSelection] = useState<number | null>(null)

  const tForm = useTranslations("dash.bots.ActionForms.AskAQuestion")
  const { register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors }, } = useForm<FormResponse>({
      resolver: zodResolver(schema),
      defaultValues: {},
      mode: 'onChange',
    });

  const watchContent = useWatch({ name: 'content', control })
  const handleClickOutside = () => {
    console.log('clicked outside')
  }

  useOnClickOutside(ref, handleClickOutside)

  useEffect(() => {
    setValue('content', message?.content ?? '')
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [message])

  const onSubmit: SubmitHandler<{ i: number }> = async ({ i }) => {
    if (i != null) {
      await updateMessageMut.mutateAsync([orgId, message?.conversationId, message?.messageId, { content: quickReplies?.[i] }])
    }
  }

  const selectedDecision = (i: number) => {
    return (
      // if the user has already selected a decision, message?.content will be populated
      // if not selected, make invisible so flex of button still occurs
      updateMessageMut.isSuccess || message?.content ? <FcCheckmark className={`text-lg ${selection !== i && 'invisible'}`} /> :
        (updateMessageMut.isLoading &&
          <CgSpinner className={`text-lg text-black animate-spin ${selection !== i && 'invisible'}`} />)
      /* {configuration.data && <DynamicBackground configuration={configuration.data} />} */
    )
  }

  useEffect(() => {
    if (updateMessageMut.isSuccess) {
      setLatestedFormSubmitted?.(true)
    }
  }, [updateMessageMut.isSuccess])


  return (
    <form className='flex flex-col justify-end w-2/3 py-2 form' ref={ref}>
      <div className="w-full max-w-xs form-control">
        {/* <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label> */}
      </div>
      <div className='flex flex-col gap-2 '>
        {/* {updateMessageMut.isLoading && <Cg className='text-xl text-gray-400 animate-spin' />} */}
        {quickReplies?.map((quickReply, i) => (
          <div className='flex flex-row w-full place-items-center gap-x-1 '>
            <button className="p-2 text-xs text-center normal-case bg-gray-200 btn-sm btn btn-ghost grow gap-x-4 rounded-xl place-items-start hover:bg-black hover:text-white" type="submit" disabled={!!message?.content || updateMessageMut.isLoading || updateMessageMut.isSuccess} onClick={() => {
              setSelection(i)
              onSubmit({ i })
            }}>{quickReply} </button>
            {selectedDecision(i)}
          </div>
        ))}
      </div>
      {errors?.content && <p className='justify-end text-xs text-end text-error'>{!!watchContent?.length && errors?.content?.message as string}</p>}
    </form>
  )
}


