import 'reactflow/dist/style.css';

import EmojiPicker, {
    Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
    SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import {
    Action, Condition, triggerInterval, VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import { FcInfo } from 'react-icons/fc';
import {
    Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position,
    updateEdge, useEdges, useNodeId, useNodes
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { useNodeContext } from '../../BotEditor';
import { defaultOutputs, OutputFieldKey, OutputFieldsKeys, triggerNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };


const schema = z.object({
  triggerInterval: z.enum(triggerInterval),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type VisitorClicksOnChatIconData = z.infer<typeof schema>
type FormValues = VisitorClicksOnChatIconData

const type = VisitorBotInteractionTrigger.VisitorClicksChatIcon

export const VisitorClicksOnChatIconTriggerNode: FC<NodeProps> = (node) => {
  const outputKey = OutputFieldsKeys[type]
  const edges = [...useEdges()];
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.[outputKey]?.some((label: string) => label)

  return (
    <div className={`w-16 place-items-center  `} >
      <NodeWrapper nodeElement={triggerNode(type)} nodeName={tNodes(`VisitorBotInteractionTrigger.VisitorClicksChatIcon`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}

export const VisitorClicksOnChatIconTriggerEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const VisitorClicksOnChatIconTriggerForm: React.FC<Props> = ({ node }) => {
  const [nodes, setNodes] = useNodeContext()
  const ref = useRef(null)

  const tDash = useTranslations("dash")
  const tForm = useTranslations("dash.bots.ConditionForms.TriggerInterval")
  const tTriggerInterval = useTranslations('dash.bots.triggerInterval')
  const { register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        triggerInterval: 'send once per 24 hours',
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
    setValue('triggerInterval', apiValues?.triggerInterval)
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
      <div className="w-full max-w-xs form-control gap-y-2">
        <label className="label">
          <span className="label-text">{tForm('label')}</span>
        </label>
        <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm" {...register('triggerInterval')}>
          {triggerInterval?.map((interval) => (
            <option key={interval} label={tTriggerInterval(interval)} value={interval}></option>
          ))}
        </select>
      </div>
    </form >
  )
}


