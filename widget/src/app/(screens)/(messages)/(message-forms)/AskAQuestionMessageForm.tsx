import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
import { a } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiLoaderAlt, BiSend } from 'react-icons/bi';
import { BsPlus, BsX } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { FcCheckmark, FcPicture } from 'react-icons/fc';
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
  formSubmittedState?: [boolean, Dispatch<SetStateAction<boolean>>]
}

export const AskAQuestionMessageForm: React.FC<Props> = ({ message, formSubmittedState }) => {
  const [_, setLatestedFormSubmitted] = formSubmittedState ?? []
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

  const messageSchema = z.object({
    content: z.string(
      { required_error: errorMessage }
    )?.min(1)
  })

  const numberSchema = z.object({
    content: z.number({ required_error: errorMessage })
  })

  const filesSchema = z.object({
    attachments: z?.custom<FileList>()?.optional()
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
  const [attachments, setAttachments] = useState<string[]>([])
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
      } else if (validationType === 'Message') {
        setSchema(messageSchema)
        setPlaceholder('')
      } else if (validationType === 'File') {
        setSchema(filesSchema)
        setPlaceholder('filesSchema')
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
      mode: 'onBlur',
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
    setValue('attachments', message?.attachments)
    if (message?.attachments) {
      console.log(message?.attachments)
      setAttachments(message?.attachments ?? []);
      // message?.attachments?.map((attachment) => URL?.createObjectURL(attachment)
    }
  }, [message])

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    await updateMessageMut.mutateAsync([orgId, message?.conversationId, message?.messageId, values])
  }

  useEffect(() => {
    if (updateMessageMut.isSuccess) {
      setLatestedFormSubmitted?.(true)
    }
  }, [updateMessageMut.isSuccess])

  const onFileInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e?.currentTarget?.files;
    for (let i = 0; i < (files?.length ?? 0); i++) {
      setAttachments([...attachments, URL?.createObjectURL(files?.item(i) as Blob)])
    }
  }

  let messageForm: ReactNode

  switch (validationType) {
    case 'File':
      messageForm = (<div className='relative w-full bg-gray-200/10 group'>
        {attachments.map((attachmentSrc, i) => (
          <>
            <BsX onClick={() => {
              setAttachments(attachments.splice(i, 1))
            }} className='absolute top-0 right-0 z-10 invisible text-2xl hover:cursor-pointer group-hover:visible'></BsX>
            <img src={attachmentSrc} className='h-20 aspect-square'></img>
          </>
        ))}
        <div className='flex flex-row'>
          <input type="file" accept=".jpg, .jpeg, .png, .pdf, .docx, .gif" className="w-full max-w-xs h-200 file-input file-input-sm input-ghost"  {...register('attachments')} name={'attachments'} onChange={onFileInputChange} />
          <FcPicture className='text-2xl' />
        </div>
        {errors?.attachments && <p className='justify-start text-xs text-error'>{errors?.attachments?.message?.toString()}</p>}
      </div>)
    case 'Message':
      messageForm = (<div className='flex flex-row select-none place-items-center gap-x-2'>
        <textarea autoComplete='off' disabled={updateMessageMut?.isSuccess || !!message?.content || updateMessageMut.isLoading} placeholder={formPlaceholder ?? tWidget(placeholder)} className={`w-full select-none bg-gray-200 rounded-xl text-xs resize-none textarea textarea-sm  focus:outline-0 ${watchContent?.length && !(errors?.content?.message as string) && 'input-success'} ${watchContent?.length && (errors?.content?.message as string) && 'input-error'}`} {...register('content')} />
        <button
          className={`w-4 h-4 text-md border-0 rounded-m place-items-center`}
          data-testid="msg-send"
          type="submit"
          disabled={!!message?.content || updateMessageMut.isLoading || updateMessageMut.isSuccess}
        >
          {updateMessageMut.isSuccess ? <FcCheckmark className='text-lg' /> :
            (updateMessageMut.isLoading ?
              <CgSpinner className="text-lg text-black animate-spin" />
              : <BiSend className="text-lg" />)
            /* {configuration.data && <DynamicBackground configuration={configuration.data} />} */
          }
        </button>
        {errors?.content && <p className='justify-end text-xs text-end text-error'>{!!watchContent?.length && errors?.content?.message as string}</p>}
      </div>)

    default:
      messageForm = (<div className='flex flex-row select-none place-items-center gap-x-2'>
        <input autoComplete='off' disabled={updateMessageMut?.isSuccess || !!message?.content || updateMessageMut.isLoading} placeholder={formPlaceholder ?? tWidget(placeholder)} className={`w-full select-none bg-gray-200 rounded-xl text-xs input input-sm  focus:outline-0 ${watchContent?.length && !(errors?.content?.message as string) && 'input-success'} ${watchContent?.length && (errors?.content?.message as string) && 'input-error'}`} {...register('content')} />
        <button
          className={`w-4 h-4 text-md border-0 rounded-m place-items-center`}
          data-testid="msg-send"
          type="submit"
          disabled={!!message?.content || updateMessageMut.isLoading || updateMessageMut.isSuccess}
        >
          {updateMessageMut.isSuccess ? <FcCheckmark className='text-lg' /> :
            (updateMessageMut.isLoading ?
              <CgSpinner className="text-lg text-black animate-spin" />
              : <BiSend className="text-lg" />)
            /* {configuration.data && <DynamicBackground configuration={configuration.data} />} */
          }
        </button>
        {errors?.content && <p className='justify-end text-xs text-end text-error'>{!!watchContent?.length && errors?.content?.message as string}</p>}
      </div>)
  }





  return (
    <form className='flex flex-col justify-end w-2/3 py-2 select-none form' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        {/* <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label> */}
      </div>

    </form >
  )
}


