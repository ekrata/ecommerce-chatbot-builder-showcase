import EmojiPicker, {
  Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
  SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import {
  addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, EdgeLabelRenderer,
  EdgeProps, getBezierPath, Handle, Node, Position, useEdges, useNodeId, useNodes
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';

import { useInteractionContext, useNodeContext } from '../../BotEditor';
import { actionNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

type FormValues = {
  message: string
  quickReplies: string[]
}

type NodeData = FormValues & FieldErrors<FormValues>

export const DecisionQuickRepliesActionNode = (node: Node) => {
  const edges = [...useEdges()];
  const tNodes = useTranslations('dash.bots.nodes')

  const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.quickReplies?.some((quickReply: object | undefined) => quickReply)

  return (
    <div className={`w-16 animate-fade `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(Action.DecisionQuickReplies)} nodeName={tNodes(`Action.DecisionQuickReplies`)} hasErrors={hasErrors} />
      <Handle type="target" position={Position.Left} id="a" className='w-2 h-2' />
      <Handle type="target" position={Position.Right} id="b" className='w-2 h-2' />
    </div >
  );
}



export const DecisionQuickRepliesActionConnection: ConnectionLineComponent = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineType,
  connectionLineStyle,
}) => {
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle cx={toX} cy={toY} fill="#222" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export const DecisionQuickRepliesActionEdge = (
  {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
  }: EdgeProps) => {
  const edges = useEdges()
  const nodes = useNodes()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = edges.find((edge) => edge.id === id)
  const [label, setLabel] = useState<string>('');

  console.log(edgeData)


  useEffect(() => {
    // get all edges of target node
    const nodeEdges = edges.filter((edge) => edge.targetNode?.id === edgeData?.targetNode?.id)
    const nodeData = nodes.find((node) => node.id === edgeData?.target)
    console.log(nodeData)
    if (nodeData?.data?.quickReplies) {
      console.log(nodeData?.data?.quickReplies)
      console.log(label)
      const edgeCount = nodeEdges.length

      // get index of current node
      const position = nodeEdges.findIndex((nodeEdge) => nodeEdge.id === id)
      console.log(position)
      console.log(nodeEdges)
      console.log(edgeCount)
      if (position < nodeData?.data?.quickReplies.length) {
        setLabel(`${position + 1}: ${nodeData?.data?.quickReplies[position]} `)
      }
    }

  }, [edges])

  return (
    <div key={id}>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </div>
  );
}


const resolver: Resolver<FormValues> = async (values) => {
  const errors: FieldErrors<FormValues> = { message: undefined, quickReplies: [] }
  if (!values?.message) {
    errors.message = {
      type: 'required',
      message: 'This is required'
    }
  }
  values.quickReplies.forEach((quickReply, i) => {
    if (errors.quickReplies) {
      if (!quickReply) {
        errors.quickReplies[i] = {
          type: 'required',
          message: 'This is required'
        }
      };
      if (quickReply) {
        errors.quickReplies[i] = undefined
      };
    }
  })

  if (errors.quickReplies && values?.quickReplies.length < 1) {
    errors.quickReplies[0] = {
      type: 'required',
      message: 'You must create at least one quick reply'
    }
  }
  return {
    values,
    errors
  }
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
    setError,
    formState: { errors }, } = useForm<FormValues>({
      resolver,
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
    setError('message', node?.data?.errors?.message)
    setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  useEffect(() => {
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }





  return (
    <form className='flex flex-col place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      {/* {actionNode(Action.DecisionQuickReplies)} */}
      {/* {tNodes(`Action.DecisionQuickReplies`)} */}
      {/* {node?.id} */}
      <textarea className='w-full h-20 p-2 mx-4 bg-gray-200 gap-y-1 textarea' {...register("message")} />
      {errors.message && <p className='justify-start text-xs text-red-500'>{errors.message.message}</p>}
      <div className='mb-10 divider'></div>
      {fields.map((field, index) => (
        <>
          <TextareaField fieldName={'quickReplies'} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
          {errors?.quickReplies?.[index] && <p className='justify-start mb-6 text-xs text-red-500'>{errors?.quickReplies?.[index]?.message}</p>}
        </>
      ))}
      <button onClick={() => append('New reply')} className='justify-center w-1/2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
    </form >
  )
}


