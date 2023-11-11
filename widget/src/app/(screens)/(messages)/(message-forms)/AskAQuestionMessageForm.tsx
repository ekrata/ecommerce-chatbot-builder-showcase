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
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  message: EntityItem<typeof Message>
}

export const AskAQuestionMessageForm: React.FC<Props> = ({ message }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const tWidget = useTranslations('chat-widget')

  const orgQuery = useOrgQuery()
  const orgId = orgQuery?.data?.orgId ?? ''
  const messageFormData = JSON.parse(message?.messageFormData ?? '{}') as AskAQuestionData
  const { validationType, errorMessage, formPlaceholder } = messageFormData
  console.log(validationType)

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

  const [schema, setSchema] = useState<any>(emailSchema);
  const [placeholder, setPlaceholder] = useState<any>('emailInputPlaceholder ');
  // const [nodes, setNodes, onNodesChange] = useNodeContext()
  const updateMessageMut = useUpdateMessageMut(message?.orgId, message?.conversationId, message?.messageId);
  // const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)
  useEffect(() => {
    if (typeof message?.messageFormData === 'string') {
      if (validationType === 'Email') {
        setSchema(emailSchema)
        setPlaceholder('emailInputPlaceholder')
      } else if (validationType === 'Name') {
        setSchema(nameSchema)
        setPlaceholder('nameInputPlaceholder')
      } else if (validationType === 'Number') {
        setSchema(numberSchema)
        setPlaceholder('numberInputPlaceholder')
      } else if (validationType === 'Phone Number') {
        setSchema(phoneNumberSchema)
        setPlaceholder('phoneNumberInputPlaceholder')
      } else if (validationType === 'URL') {
        setSchema(urlSchema)
        setPlaceholder('urlInputPlaceholder')
      }
    }
  }, [validationType])

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

  return (
    <form className='flex flex-col justify-end w-2/3 form' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        {/* <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label> */}
      </div>
      <div className='flex flex-row place-items-center gap-x-2'>
        {/* {updateMessageMut.isLoading && <Cg className='text-xl text-gray-400 animate-spin' />} */}
        <input disabled={updateMessageMut?.isSuccess || !!message?.content || updateMessageMut.isLoading} placeholder={formPlaceholder ?? tWidget(placeholder)} className={`w-full bg-gray-200 rounded-md text-xs input input-sm input-bordered focus:outline-0 ${watchContent?.length && !(errors?.content?.message as string) && 'input-success'} ${watchContent?.length && (errors?.content?.message as string) && 'input-error'}`} {...register('content')} />
        <button
          className={`w-4 h-4 text-md border-0 rounded-m place-items-center`}
          data-testid="msg-send"
          type="submit"
          disabled={updateMessageMut?.isLoading}
        >
          {updateMessageMut.isSuccess ? <FcCheckmark className='text-lg' /> :
            (updateMessageMut.isLoading ?
              <CgSpinner className="text-lg text-black animate-spin" />
              : <BiSend className="text-lg" />)
            /* {configuration.data && <DynamicBackground configuration={configuration.data} />} */
          }
        </button>
      </div>
      {errors?.content && <p className='justify-end text-xs text-end text-error'>{!!watchContent?.length && errors?.content?.message as string}</p>}
    </form >
  )
}


