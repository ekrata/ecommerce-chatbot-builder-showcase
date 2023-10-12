import EmojiPicker, {
  Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
  SuggestionMode, Theme
} from 'emoji-picker-react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  SubmitHandler, useFieldArray, UseFieldArrayReturn, useForm, UseFormRegister
} from 'react-hook-form';
import { BiCross } from 'react-icons/bi';
import { BsPlus, BsX } from 'react-icons/bs';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { MdOutlineDarkMode } from 'react-icons/md';
import { toast } from 'react-toastify';
import { Handle, Node, Position } from 'reactflow';
import { json } from 'stream/consumers';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';

import { useNodeContext } from '../../BotEditor';
import { actionNode } from '../../nodes';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

export const DecisionQuickRepliesActionNode = () => {
  const tNodes = useTranslations('dash.bots.nodes')
  return (
    <div className='w-16'>
      <Handle type="source" position={Position.Top} className='' />
      <div className='flex flex-col justify-center w-20 text-center gap-y-1 place-items-center'>
        <div className='justify-center mt-2 '>
          {actionNode(Action.DecisionQuickReplies)}
        </div>
        <p className="text-xs font-light text-center bg-white shadow-2xl select-none">
          {tNodes(`Action.DecisionQuickReplies`)}
        </p>
      </div >
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="target" position={Position.Right} id="b" />
    </div>
  );
}

type FormValues = {
  message: string
  quickReplies: string[]
}

interface Props {
  node: Node
}

export const DecisionQuickRepliesActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string

  const tForm = useTranslations("dash.bots.ActionForms.DecisionQuickReplies")
  const { register,
    handleSubmit,
    control,
    watch,
    setValue,


    formState: { errors, }, } = useForm<FormValues>({
      defaultValues: {
        message: '',
        quickReplies: []
      },
    });

  const fieldArray = useFieldArray({
    name: 'quickReplies',
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  useEffect(() => {
    const apiValues: FormValues = JSON.parse(node?.data ?? '{}')
    setValue('message', apiValues?.message ?? tForm('defaultMessage'))
    setValue('quickReplies', apiValues?.quickReplies ?? [tForm('defaultReply1'), tForm('defaultReply2')])
  }, [node])

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    console.log(values)
    updateNodes(values, node, nodes, setNodes)
  }



  return (
    <form className='flex flex-col place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)}>

      {/* {actionNode(Action.DecisionQuickReplies)} */}
      {/* {tNodes(`Action.DecisionQuickReplies`)} */}
      <textarea className='w-full h-20 p-2 mx-4 bg-gray-200 gap-y-1 textarea' {...register("message")} />
      <div className='mb-10 divider'></div>
      {fields.map((field, index) => (
        <TextareaField field={field} index={index} fieldArray={fieldArray} register={register} />
      ))}
      <button onClick={() => append('New reply')} className='justify-center w-1/2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
    </form >
  )
}


