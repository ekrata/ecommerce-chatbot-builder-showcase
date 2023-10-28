import 'reactflow/dist/style.css';

import EmojiPicker, {
  Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
  SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import {
  addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
  EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position, updateEdge,
  useEdges, useNodeId, useNodes, useUpdateNodeInternals
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/src/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/src/app/[locale]/(hooks)/queries/useBotQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEdgeContext, useNodeContext } from '../../BotEditor';
import { actionNode, OutputFieldsKeys } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { filterByEdgeTargetHandle } from '../shared/filterByEdgeTargetHandle';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

const schema = z.object({
  message: z.string()?.min(1),
  transferToOperatorMessage: z?.boolean(),
  quickReplies: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

const type = Action.DecisionQuickReplies

export type DecisionQuickRepliesData = z.infer<typeof schema>
type FormValues = DecisionQuickRepliesData
type NodeData = FormValues & FieldErrors<FormValues>

export const DecisionQuickRepliesActionNode: FC<NodeProps> = (node) => {
  const [edges, setEdges] = useEdgeContext()
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  // (node?.data?.errors?.quickReplies ?? [])((quickReply: object | undefined) => quickReply);
  const hasErrors: boolean = node?.data?.errors?.message && node?.data?.errors?.quickReplies?.some((label: string) => label)
  const hasTooManyConnections: boolean = useMemo(() => nodeEdges?.length > node?.data?.quickReplies?.length, [nodeEdges?.length, node]);

  return (
    <div className={`w-16  `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.DecisionQuickReplies`)} hasErrors={hasErrors} hasTooManyConnections={hasTooManyConnections} />
      {createTargetHandles(node, nodeEdges, 'quickReplies')}
    </div >
  )
}

export const DecisionQuickRepliesActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const DecisionQuickRepliesActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const params = useParams();
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.DecisionQuickReplies")
  const tDecisionForm = useTranslations("dash.bots.ActionForms.GenericDecision")
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
        message: '',
        quickReplies: []
      },
      mode: 'onBlur',
    });



  const fieldArray = useFieldArray({
    name: 'quickReplies' as never,
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  const handleClickOutside = () => {
    // Your custom logic here
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('message', apiValues?.message ?? tForm('defaultMessage'))
    setValue('quickReplies', apiValues?.quickReplies ?? [tForm('defaultReply1'), tForm('defaultReply2')])
    setValue('transferToOperatorMessage', apiValues?.transferToOperatorMessage ?? false)
    // setError('message', node?.data?.errors?.message)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  // useEffect(() => {
  //   updateNodes(getValues(), node, nodes, setNodes, errors)
  // }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }

  // useEffect(() => {
  //   handleSubmit(onSubmit)
  // }, [])

  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <TextareaField fieldName={'message'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea textarea-xs focus:outline-0' />
      {errors.message && <p className='justify-start text-xs text-error'>{errors.message.message}</p>}
      <div className='mb-10 divider'></div>

      {errors?.quickReplies && <p className='justify-start mb-6 text-xs text-error'>{errors?.quickReplies?.message}</p>}
      {fields.map((field, index) => (
        <>
          <TextareaField fieldName={'quickReplies'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
          {errors?.quickReplies?.[index] && <p className='justify-start mb-6 text-xs text-error'>{errors?.quickReplies?.[index]?.message}</p>}
        </>
      ))}
      <button onClick={() => append('New reply')} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
      <span className="text-xs text-gray-200 label-text">{tDecisionForm("facebookCatch")}</span>
      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">{tDecisionForm("transferToOperatorMessageLabel")}</span>
          <input type="checkbox" className="toggle toggle-info"  {...register('transferToOperatorMessage')} />
        </label>
      </div>
      {errors?.transferToOperatorMessage && <p className='justify-start text-xs text-red-500'>{errors?.transferToOperatorMessage?.message}</p>}
    </form >
  )
}


