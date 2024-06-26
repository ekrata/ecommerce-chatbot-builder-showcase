import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
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

import { Operator } from '@/entities/operator';
import { Action, Agent } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';

import { OutputFieldsKeys } from '../../../outputFields';
import { agentGradients } from '../../agentGradients';
import { useNodeContext } from '../../BotEditor';
import { actionNode, agentNode, defaultOutputs, successFailureOutput } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

export const salesAgentToolset = ['sales'];


const schema = z.object({
  name: z.string()?.min(1),
  businessRole: z.string()?.min(1),
  companyName: z.string()?.min(1),
  companyBusiness: z.string().min(40),
  companyValues: z.string()?.min(40),
  conversationPurpose: z.string()?.min(10),
  toolset: z.object({ name: z.string(), description: z.string(), active: z.boolean().optional() })?.array(),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),

})

export type SalesBotAgentData = z.infer<typeof schema>
export type FormValues = SalesBotAgentData

const type = Agent.SalesBotAgent

export const SalesBotAgentNode: FC<NodeProps> = (node) => {
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
      <NodeWrapper nodeElement={agentNode(type, agentGradients?.['Sales Agent'] ?? '')} nodeName={tNodes(`Agent.SalesBotAgent`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}


export const SalesBotAgentEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const SalesBotAgentForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.AgentForms.SalesBotAgent")
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
        companyName: (operatorSession as EntityItem<typeof Operator>)?.name,
        companyBusiness: '',
        companyValues: tForm('companyValuesPlaceholder'),
        conversationPurpose: tForm('conversationPurposePlaceholder'),
        businessRole: tForm('businessRolePlaceholder'),
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

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "toolset", // unique name for your Field Array
  });

  // const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

  useEffect(() => {
    const apiValues: FormValues = node?.data
    console.log('apivalues', apiValues)
    setValue('name', apiValues.name)
    setValue('businessRole', apiValues.businessRole)
    setValue('companyName', apiValues.companyName)
    setValue('companyBusiness', apiValues.companyBusiness)
    setValue('companyValues', apiValues.companyValues)
    setValue('conversationPurpose', apiValues.conversationPurpose)
    setValue('toolset', apiValues.toolset)
  }, [node])

  useEffect(() => {
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }


  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Agent Name')}</span>
        </label>
        <input type="text" placeholder={tForm('Agent Name')} className="w-full max-w-xs bg-gray-200 input-sm input"  {...register('name')} />
      </div>
      {errors?.name && <p className='justify-start text-xs text-error'>{errors?.name.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Company Name')}</span>
        </label>
        <input type="text" placeholder={tForm('Company Name')} className="w-full max-w-xs bg-gray-200 input-sm input"  {...register('companyName')} />
      </div>
      {errors?.companyName && <p className='justify-start text-xs text-error'>{errors?.companyName.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Business Role')}</span>
        </label>
        <input type="text" placeholder={tForm('businessRolePlaceholder')} className="w-full max-w-xs bg-gray-200 input-sm input"  {...register('businessRole')} />
      </div>
      {errors?.companyBusiness && <p className='justify-start text-xs text-error'>{errors?.businessRole?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Company Business')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'companyBusiness'} placeholder={tForm('companyBusinessPlaceholder')} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      </div>
      {errors?.companyBusiness && <p className='justify-start text-xs text-error'>{errors?.companyBusiness?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Company Values')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'companyValues'} placeholder={tForm('companyValuesPlaceholder')} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      </div>
      {errors?.companyValues && <p className='justify-start text-xs text-error'>{errors?.companyValues?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Conversation Purpose')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'conversationPurpose'} placeholder={tForm('conversationPurposePlaceholder')} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      </div>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('Tools')}</span>
        </label>
        < div className='flex flex-row justify-between place-items-center gap-x-2' >
          <input type="checkbox" onClick={() => onSubmit(getValues())} className="checkbox checkbox-info checkbox-sm"  {...register(`toolset.0.active`)} checked={fields?.[0]?.active} />
          <label className="label">
            <span className="text-xs label-text">{tDash(`AgentToolNames.Product Search`) as string}</span>
            <span className="text-xs label-text">{tDash(`AgentToolDescriptions.Product Search`) as string}</span>
          </label>
        </div>
        < div className='flex flex-row justify-between place-items-center gap-x-2' >
          <input type="checkbox" onClick={() => onSubmit(getValues())} className="checkbox checkbox-info checkbox-sm"  {...register(`toolset.1.active`)} checked={fields?.[1]?.active} />
          <label className="text-xs label">
            <span className="text-xs label-text">{tDash(`AgentToolNames.Document Search`) as string}</span>
            <span className="text-xs label-text">{tDash(`AgentToolDescriptions.Document Search`) as string}</span>
          </label>
        </div>
      </div>
    </form >
  )
}


