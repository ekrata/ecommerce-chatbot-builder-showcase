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

import { zodResolver } from '@hookform/resolvers/zod';

import { useNodeContext } from '../../BotEditor';
import { actionNode, defaultOutputs, OutputFieldsKeys } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };




const schema = z.object({
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type FormValues = z.infer<typeof schema>
type NodeData = FormValues & FieldErrors<FormValues>

const type = Action.SubscribeForMailing

export const SubscribeForMailingNode = (node: Node) => {
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
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.SubscribeForMailing`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}


export const SubscribeForMailingEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const SubscribeForMailingForm: React.FC<Props> = ({ node }) => {
  const [nodes, setNodes] = useNodeContext()
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.SubscribeForMailing")
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
          <span className="label-text">{tForm('description')}</span>
        </label>
      </div>
      {/* {errors?. && <p className='justify-start text-xs text-error'>{errors?.message?.message}</p>} */}
      <div className=" text-bold">{tForm('Quick Tip')}</div>
      <ol className="space-y-2 text-sm list-decimal gap-y-2">
        <li className="">{tForm('tip1')}</li>
        <li className="">{tForm('tip2')}</li>
        <li className="">{tForm('tip3')}</li>
      </ol>
    </form >
  )
}


