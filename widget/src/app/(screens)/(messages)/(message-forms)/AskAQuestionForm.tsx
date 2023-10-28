import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
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
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  message: EntityItem<typeof Message>
}

export const AskAQuestionMessageForm: React.FC<Props> = ({ message }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')

  const orgQuery = useOrgQuery()
  const orgId = orgQuery?.data?.orgId ?? ''
  const messageFormData = JSON.parse(message?.messageFormData ?? '{}') as AskAQuestionData
  const { validationType, errorMessage } = messageFormData

  const emailSchema = z.object({
    content: z.string({
      required_error: errorMessage
    }).email()?.min(1)
  })

  const nameSchema = z.object({
    content: z.string(
      { required_error: errorMessage }
    )?.min(1)
  })

  const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
  );

  const phoneNumberSchema = z.object({
    content: z.string({ required_error: errorMessage }).regex(phoneRegex, 'Invalid Phone Number!'),

  })

  const numberSchema = z.object({
    content: z.number({ required_error: errorMessage })
  })

  const urlSchema = z.object({
    content: z.string({ required_error: errorMessage }).url()
  })

  type EmailSchema = z.infer<typeof emailSchema>
  const [schema, setSchema] = useState<any>(emailSchema);
  // const [nodes, setNodes, onNodesChange] = useNodeContext()
  const updateMessageMut = useUpdateMessageMut(message?.orgId, message?.conversationId, message?.messageId);
  // const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)
  if (typeof message?.messageFormData === 'string') {

    if (validationType === 'Email') {
      setSchema(emailSchema)
    } else if (validationType === 'Name') {
      setSchema(nameSchema)
    } else if (validationType === 'Number') {
      setSchema(numberSchema)
    } else if (validationType === 'Phone Number') {
      setSchema(phoneNumberSchema)
    } else if (validationType === 'URL') {
      setSchema(urlSchema)
    }
  }

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
      mode: 'onBlur',
    });

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

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    await updateMessageMut.mutateAsync([orgId, message?.conversationId, message?.messageId, values])
  }


  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-8' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label>
      </div>
      <input className='bg-gray-200 input input-sm input-ghost focus:-outline-0' {...register('content')} />
      {errors?.content && <p className='justify-start text-xs text-error'>{errors?.content?.message as string}</p>}
    </form >
  )
}


