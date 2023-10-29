import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiLoaderAlt, BiSend } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { FcCheckmark } from 'react-icons/fc';
import {
  Edge, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position, updateEdge, useEdges
} from 'reactflow';
import { useCreateMessageMut } from 'src/app/(actions)/mutations/useCreateMessageMut';
import { useUpdateMessageMut } from 'src/app/(actions)/mutations/useUpdateMessageMut';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { useOnClickOutside } from 'usehooks-ts';
import * as z from 'zod';
import errorMap from 'zod/lib/locales/en';

import { Message, NodeFormData } from '@/entities/message';
import {
  AskAQuestionData, FormValues
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import {
  DecisionQuickRepliesData
} from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionQuickReplies';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  message: EntityItem<typeof Message>
}

export const DecisionQuickRepliesMessageForm: React.FC<Props> = ({ message }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const tWidget = useTranslations('chat-widget')

  const orgQuery = useOrgQuery()
  const orgId = orgQuery?.data?.orgId ?? ''
  const messageFormData = JSON.parse(message?.messageFormData ?? '{}') as DecisionQuickRepliesData
  const { quickReplies } = messageFormData


  const [schema, setSchema] = useState<any>(emailSchema);
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
    formState: { errors }, } = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: {},
      mode: 'onChange',
    });

  const watchContent = watch("content")

  const handleClickOutside = () => {
    // Your custom logic here
    console.log('clicked outside')
  }

  useOnClickOutside(ref, handleClickOutside)

  // const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  useEffect(() => {
    setValue('content', message?.content)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [message])

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    await updateMessageMut.mutateAsync([orgId, message?.conversationId, message?.messageId, values])
  }
  {
    updateMessageMut.isSuccess ? <FcCheckmark className='text-lg' /> :
      (updateMessageMut.isLoading ?
        <CgSpinner className="text-lg text-black animate-spin" />
        : <BiSend className="text-lg" />)
    /* {configuration.data && <DynamicBackground configuration={configuration.data} />} */
  }


  return (
    <form className='flex flex-col justify-end w-2/3 form' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        {/* <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label> */}
      </div>
      <div className='flex flex-row gap-2 place-items-center'>
        {/* {updateMessageMut.isLoading && <Cg className='text-xl text-gray-400 animate-spin' />} */}
        {quickReplies.map((quickReply, i) => (
          <button className="btn" type="submit" onClick={() => setSelection(i)}>{quickReply}</button>
        ))}
      </div>
      {errors?.content && <p className='justify-end text-xs text-end text-error'>{!!watchContent?.length && errors?.content?.message as string}</p>}
    </form >
  )
}


