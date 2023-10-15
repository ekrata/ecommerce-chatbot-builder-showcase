import EmojiPicker, {
  Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
  SuggestionMode, Theme
} from 'emoji-picker-react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
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
import { useOnClickOutside } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';

import { useNodeContext } from '../../BotEditor';
import { actionNode } from '../../nodes';
import { NodeWrapper } from '../nodeWrapper';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

export const DecisionQuickRepliesActionNode = () => {
  const tNodes = useTranslations('dash.bots.nodes')

  return (<div className={`w-16 animate-fade `} >
    <Handle type="source" position={Position.Top} className='w-2 h-2' />
    <NodeWrapper nodeElement={actionNode(Action.DecisionQuickReplies)} nodeName={tNodes(`Action.DecisionQuickReplies`)} />
    <Handle type="target" position={Position.Left} id="a" className='w-2 h-2' />
    <Handle type="target" position={Position.Right} id="b" className='w-2 h-2' />
  </div >
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
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.DecisionQuickReplies")
  const { register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      defaultValues: {
        message: '',
        quickReplies: []
      },
      mode: 'onBlur',
    });

  const fieldArray = useFieldArray({
    name: 'quickReplies',
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const handleClickOutside = () => {
    // Your custom logic here
    console.log('clicked outside')
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('message', apiValues?.message ?? tForm('defaultMessage'))
    setValue('quickReplies', apiValues?.quickReplies ?? [tForm('defaultReply1'), tForm('defaultReply2')])
  }, [node])

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    console.log(values)
    updateNodes(values, node, nodes, setNodes)
  }


  return (
    <form className='flex flex-col place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      {/* {actionNode(Action.DecisionQuickReplies)} */}
      {/* {tNodes(`Action.DecisionQuickReplies`)} */}
      {node?.id}
      <textarea className='w-full h-20 p-2 mx-4 bg-gray-200 gap-y-1 textarea' {...register("message")} />
      <div className='mb-10 divider'></div>
      {fields.map((field, index) => (
        <TextareaField fieldName={'quickReplies'} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
      ))}
      <button onClick={() => append('New reply')} className='justify-center w-1/2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
    </form >
  )
}


