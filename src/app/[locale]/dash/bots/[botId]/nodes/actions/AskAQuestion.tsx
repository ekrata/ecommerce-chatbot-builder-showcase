import 'reactflow/dist/style.css';

import EmojiPicker, {
    Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
    SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import {
    addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
    EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, Position, updateEdge, useEdges,
    useNodeId, useNodes
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
import { validationType } from '@/entities/bot';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEdgeContext, useInteractionContext, useNodeContext } from '../../BotEditor';
import { actionNode, OutputFieldsKeys } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };




const schema = z.object({
  message: z.string()?.min(1),
  validationType: z.enum(validationType),
  errorMessage: z.string()?.min(1),
  numberOfRepeats: z.coerce?.number()?.gte(0),
  saveTheAnswerAsAContactProperty: z.boolean(),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type FormValues = z.infer<typeof schema>
type NodeData = FormValues & FieldErrors<FormValues>

const type = Action.AskAQuestion

export const AskAQuestionActionNode = (node: Node) => {
  const outputKey = 'outputs'
  const edges = [...useEdges()];
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.[outputKey]?.some((label) => label)

  return (
    <div className={`w-16  `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.AskAQuestion`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}


export const AskAQuestionActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const AskAQuestionActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.AskAQuestion")
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
        outputs: ['✓ Success', '⤫ Failure']
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
    setValue('message', apiValues?.message ?? tForm('defaultQuestion'))
    setValue('validationType', apiValues?.validationType ?? 'Email')
    setValue('errorMessage', apiValues?.errorMessage ?? tForm('defaultError'))
    setValue('outputs', ['✓ Success', '⤫ Failure'])
    setValue('numberOfRepeats', apiValues?.numberOfRepeats ?? 1)
    setValue('saveTheAnswerAsAContactProperty', apiValues?.saveTheAnswerAsAContactProperty ?? false)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  useEffect(() => {
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }


  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-8' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <TextareaField deletable={false} node={node} fieldName={'message'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      {errors?.message && <p className='justify-start text-xs text-red-500'>{errors?.message?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('validationTypeLabel')}</span>
        </label>
        <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm" {...register('validationType')} >
          {validationType.map((item) =>
            <option key={item}>{item}</option>
          )}
        </select>
      </div>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('errorMessageLabel')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'errorMessage'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      </div>
      {errors?.errorMessage && <p className='justify-start text-xs text-red-500'>{errors?.errorMessage?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('numberOfRepeatsLabel')}</span>
        </label>
        <input type="number" placeholder={tForm('numberOfRepeatsLabel')} className="w-full max-w-xs bg-gray-200 input-sm input"  {...register('numberOfRepeats')} />
      </div>
      {errors?.numberOfRepeats && <p className='justify-start text-xs text-red-500'>{errors?.numberOfRepeats?.message}</p>}
      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">{tForm("Save the answer as a contact property")}</span>
          <input type="checkbox" className="toggle"  {...register('saveTheAnswerAsAContactProperty')} />
        </label>
      </div>
      {errors?.saveTheAnswerAsAContactProperty && <p className='justify-start text-xs text-red-500'>{errors?.saveTheAnswerAsAContactProperty?.message}</p>}
      {/* {
        fields.map((field, index) => (
          <>
            <TextareaField node={node} fieldName={'quickReplies'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
            {errors?.quickReplies?.[index] && <p className='justify-start mb-6 text-xs text-red-500'>{errors?.quickReplies?.[index]?.message}</p>}
          </>
        ))
      } */}
      {/* <button onClick={() => append('New reply')} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button> */}
    </form >
  )
}


