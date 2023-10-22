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
import { FcInfo } from 'react-icons/fc';
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

import { useEdgeContext, useNodeContext } from '../../BotEditor';
import { actionNode, defaultOutputs, OutputFieldsKeys } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };




const schema = z.object({
  message: z.string()?.min(1),
  couponCode: z.string()?.min(1).max(32),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type FormValues = z.infer<typeof schema>

const type = Action.CouponCode

export const CouponCodeActionNode = (node: Node) => {
  const outputKey = OutputFieldsKeys[type]
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
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.CouponCode`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}


export const CouponCodeActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const CouponCodeActionForm: React.FC<Props> = ({ node }) => {
  const [nodes, setNodes] = useNodeContext()
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.CouponCode")
  const { register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        outputs: defaultOutputs
      },
      mode: 'onBlur',
    });

  const handleClickOutside = () => {
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('message', apiValues?.message ?? tForm('defaultMessage'))
    setValue('couponCode', apiValues?.couponCode ?? tForm('defaultCouponCode'))
    setValue('outputs', apiValues?.outputs ?? defaultOutputs)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  useEffect(() => {
    console.log(errors)
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }


  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('label')}</span>
        </label>
        <TextareaField deletable={false} node={node} fieldName={'message'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      </div>
      {errors?.message && <p className='justify-start text-xs text-error'>{errors?.message?.message}</p>}
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('couponCodeLabel')}</span>
        </label>
        <input type="text" placeholder={tForm('defaultCouponCode')} className="w-full max-w-xs bg-gray-200 input-sm input"  {...register('couponCode')} />
        <label className="label">
          <span className="flex text-xs label-text gap-x-2"><FcInfo className='text-lg ' />{tForm('couponCodeDescription')}</span>
        </label>
      </div>
      {errors?.couponCode && <p className='justify-start text-xs text-error'>{errors?.couponCode?.message}</p>}
    </form >
  )
}


