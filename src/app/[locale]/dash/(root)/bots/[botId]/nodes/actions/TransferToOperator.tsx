import 'reactflow/dist/style.css';

import EmojiPicker, {
    Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
    SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import {
    Edge, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position, updateEdge, useEdges
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { validationType } from '@/entities/bot';
import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';

import { OutputFieldsKeys } from '../../../outputFields';
import { useNodeContext } from '../../BotEditor';
import { actionNode, defaultOutputs, successFailureOutput } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };




const schema = z.object({
  transferMessage: z.string()?.min(1),
  waitTimeMessage: z.string()?.min(1),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

export type TransferToOperatorData = z.infer<typeof schema>
export type FormValues = TransferToOperatorData

const type = Action.TransferToOperator

export const TransferToOperatorActionNode: FC<NodeProps> = (node) => {
  const outputKey = 'outputs'
  const edges = useEdges()
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.[outputKey]?.some((label: string) => label)

  return (
    <div className={`w-16  `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.TransferToOperator`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}


export const TransferToOperatorActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const TransferToOperatorActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.TransferToOperator")
  const { register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        transferMessage: "I'll pass this onto a human now!",
        waitTimeMessage: "Our average reply time is {averageUnassignedWaitTime}. You'll receive their responses at {email} and here. Thank you for your patience. 😌",
        outputs: defaultOutputs,
      },
      mode: 'onBlur',
    });

  const handleClickOutside = () => {
    // Your custom logic here
    console.log('clicked outside')
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)

  // const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('transferMessage', apiValues?.transferMessage || "All done! I'll pass this onto a human now!",)
    setValue('waitTimeMessage', apiValues?.waitTimeMessage || "Our average reply time is  You'll receive their responses at {email} and here. Thank you for your patience. 😌")
    setValue('outputs', defaultOutputs)
  }, [node])

  useEffect(() => {
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }

  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-8' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('transferMessageLabel')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'transferMessage'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
        {errors?.transferMessage && <p className='justify-start text-xs text-error'>{errors?.transferMessage?.message}</p>}
        <label className="label">
          <span className="label-text">{tForm('waitTimeMessageLabel')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'waitTimeMessage'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
        {errors?.transferMessage && <p className='justify-start text-xs text-error'>{errors?.transferMessage?.message}</p>}
      </div>
    </form >
  )
}


