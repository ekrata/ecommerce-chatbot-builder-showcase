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

import { useNodeContext } from '../../BotEditor';
import { actionNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

type FormValues = {
  messages: [string | FileList]
}

type NodeData = FormValues & FieldErrors<FormValues>

export const SendAChatMessageActionNode = (node: Node) => {
  const edges = [...useEdges()];
  const tNodes = useTranslations('dash.bots.nodes')

  const hasErrors: boolean = node?.data?.errors?.messages?.some((content: object | undefined) => content)

  return (
    <div className={`w-16 animate-fade `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(Action.SendAChatMessage)} nodeName={tNodes(`Action.SendAChatMessage`)} hasErrors={hasErrors} />
      <Handle type="target" position={Position.Left} id="b" className='w-2 h-2' />
      <Handle type="target" position={Position.Right} id="c" className='w-2 h-2' />
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
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export const SendAChatMessageActionEdge = (
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
  const label = useState<string>('');

  console.log(edgeData)

  console.log(edgeData)

  useEffect(() => {
    // get all edges of target node
    const nodeEdges = edges.filter((edge) => edge.targetNode?.id === edgeData?.targetNode?.id)
    console.log(nodeEdges)
    const nodeData = edgeData?.targetNode?.data as NodeData
    if (nodeData?.quickReplies) {
      const edgeCount = nodeEdges.length
      nodeData.quickReplies.length + 1
    }

  }, [edges])

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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

        </div>
      </EdgeLabelRenderer>
    </>
  );
}


const resolver: Resolver<FormValues> = async (values) => {
  const errors: FieldErrors<FormValues> = { messages: [] }
  values.messages.forEach((message, i) => {
    if (errors.messages) {
      if (!message) {
        errors.messages[i] = {
          type: 'required',
          message: 'This is required'
        }
      };
      if (message) {
        errors.messages[i] = undefined
      };
    }
  })

  if (errors.messages && values?.messages.length < 1) {
    errors.messages[0] = {
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

export const SendAChatMessageActionForm: React.FC<Props> = ({ node }) => {
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
        messages: []
      },
      mode: 'onBlur',
    });

  const fieldArray = useFieldArray({
    name: 'messages',
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
    setValue('messages', apiValues?.messages ?? tForm('defaultMessage'))
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
      <div className='mb-10 divider'></div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <TextareaField key={field.id} fieldName={'messages'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
          {errors?.messages?.[index] && <p className='justify-start mb-6 text-xs text-red-500'>{errors?.messages?.[index]?.message}</p>}
        </div>
      ))}
      <button onClick={() => append('New reply')} className='justify-center w-1/2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
    </form >
  )
}


