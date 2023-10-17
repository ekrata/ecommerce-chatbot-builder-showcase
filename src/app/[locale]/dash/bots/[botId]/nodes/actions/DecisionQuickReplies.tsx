import 'reactflow/dist/style.css';

import EmojiPicker, {
    Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
    SuggestionMode, Theme
} from 'emoji-picker-react';
import { c } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { FC, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import {
    addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
    EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, Position, updateEdge, useEdges,
    useNodeId, useNodes, useUpdateNodeInternals
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEdgeContext, useInteractionContext, useNodeContext } from '../../BotEditor';
import { actionNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { filterByEdgeTargetHandle } from '../shared/filterByEdgeTargetHandle';
import { getNextUnusedLabel } from '../shared/getNextUnusedLabel';
import { TextareaField } from '../shared/TextareaField';
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };



const schema = z.object({
  message: z.string(),
  quickReplies: z.array(z.string()).refine(items => new Set(items).size === items.length, {
    message: 'Must be an array of unique strings',
  }),
})

type FormValues = z.infer<typeof schema>
type NodeData = FormValues & FieldErrors<FormValues>

export const DecisionQuickRepliesActionNode = (node: Node) => {
  const [edges, setEdges] = useEdgeContext()
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  // (node?.data?.errors?.quickReplies ?? [])((quickReply: object | undefined) => quickReply);
  const hasErrors: boolean = node?.data?.errors?.message
  const hasTooManyConnections: boolean = useMemo(() => nodeEdges?.length > node?.data?.quickReplies?.length, [nodeEdges?.length, node]);

  // const removeEdgeOnDecisionDelete
  useEffect(() => {
    if (nodeEdges?.length > node?.data?.quickReplies?.length) {
      console.log(nodeEdges)
      const allLabels = node?.data?.quickReplies?.map((reply, i) => `${reply}`)
      const oldLabels = nodeEdges.map((edge) => edge?.data?.label)
      // remove edge where the label can no longer be created from quickReplies ()
      console.log(allLabels, nodeEdges.map((edge) => edge?.data?.label), oldLabels)

      // deincrement node target labels on delete
      const remainingEdges = nodeEdges.filter((edge) => allLabels.includes(edge?.data?.label))
      // get index where edge was removed, indexes higher need to be deincremented by 1
      const edgeRemovedIndex = oldLabels.findIndex((oldLabel) => !allLabels.includes(oldLabel))
      console.log(edgeRemovedIndex)
      // can assume this will always be one, as length change will retrigger
      const edgeDelta = nodeEdges.length - remainingEdges.length


      // ie. 1a, 1b, 2a
      // remove 1b
      // becomes 1a, 1b
      // deincrement target handle id
      console.log(nodeEdges?.slice(edgeRemovedIndex + 1))
      console.log(nodeEdges?.slice(0, edgeRemovedIndex))
      const newNodeEdges = [...nodeEdges?.slice(0, edgeRemovedIndex), ...nodeEdges?.slice(edgeRemovedIndex + 1)].map((edge, i) => {
        console.log('hiii')
        if (edge?.targetHandle) {
          // const num = parseInt(edge?.targetHandle?.replace(/\D/g, '') ?? '1', 10)
          // const letter = edge?.targetHandle?.replace(/[0-9]/g, '') as 'a' | 'b'
          // console.log(num, letter)
          // const labelText = edge?.data?.label.split(': ')[1]
          // preventing deincrementing the first index
          const pairIndex = (i + 1) > 1 ? Math.round((i + 1) / 2) : 1
          console.log(i, pairIndex)
          if (i % 2 == 0) {
            const newId = `${pairIndex}a`
            console.log(newId)
            return { ...edge, targetHandle: newId, id: edge.id.replace(edge?.targetHandle, newId) }
          }
          else {
            const newId = `${pairIndex}b`
            console.log(newId)
            console.log(edge?.targetHandle, newId, edge.id.replace(edge?.targetHandle, newId))
            return { ...edge, targetHandle: newId, id: edge.id.replace(edge?.targetHandle, newId) }
          }
        }
      })
      console.log(newNodeEdges)
      // old node edges ids 
      const oldNodeEdgesIds = nodeEdges.map((edge) => edge.id)



      // get all edges without old node edges
      const otherEdges = edges.filter((oldEdge) => !oldNodeEdgesIds.includes(oldEdge.id))
      console.log(otherEdges, newNodeEdges)
      const newEdges = [...otherEdges as Edge<unknown>[], ...(newNodeEdges?.length ? newNodeEdges as Edge<unknown>[] : [])].filter(Boolean)

      setEdges(newEdges)

    }
  }, [node, node?.data?.quickReplies?.length])
  // Add two new target nodes for every quick reply that exists.
  // Allows the user to drag from same visible target handle to the same source handle.
  // hide handle on connect if there is more than one handle so the user cannot connect an already connected handle which leads bugs
  const renderHandles = useCallback(() => {
    const updateNodeInternals = useUpdateNodeInternals()
    // get edges of node
    const handles = node?.data?.quickReplies?.map((quickReply, i) => {
      const pairIndex = (i + 1) > 1 ? Math.round((i + 1) / 2) : 1
      const leftId = `${pairIndex}a`
      const rightId = `${pairIndex}b`
      // if edge count 

      const isConnectable = node?.data?.quickReplies?.length >= nodeEdges.length
      return (
        <>
          <Handle type="target" position={Position.Left} isConnectable={isConnectable} id={leftId} className={`w-2 h-2 ${edges?.find((edge) => edge?.targetHandle === leftId) && 'invisible'}`} />
          <Handle type="target" position={Position.Right} isConnectable={isConnectable} id={rightId} className={`w-2 h-2 ${edges?.find((edge) => edge?.targetHandle === rightId) && 'invisible'}`} />
        </>
      )
    })
    updateNodeInternals(node?.id)
    return handles

  }, [node?.data?.quickReplies?.length, node, edges, nodeEdges])

  return (
    <div className={`w-16 animate-fade `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(Action.DecisionQuickReplies)} nodeName={tNodes(`Action.DecisionQuickReplies`)} hasErrors={hasErrors} hasTooManyConnections={hasTooManyConnections} />
      {renderHandles()}

    </div >
  );
}


interface ConnectionProps {
  params: ConnectionLineComponentProps,
  label: string
}

export const DecisionQuickRepliesActionConnection: FC<ConnectionProps> = (props) => {
  if (props?.params) {
    const { params } = props
    if (params?.fromX && params?.fromY && params?.fromPosition && params?.toX && params?.toY && params?.toPosition) {
      const {
        fromX,
        fromY,
        fromPosition,
        toX,
        toY,
        toPosition,
        connectionLineStyle
      } = params
      const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: fromX ?? 0,
        sourceY: fromY ?? 0,
        sourcePosition: fromPosition ?? 0,
        targetX: toX ?? 0,
        targetY: toY ?? 0,
        targetPosition: toPosition ?? 0,
      });

      return (
        <>
          {edgePath && <BaseEdge path={edgePath} style={connectionLineStyle} />}
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                fontSize: 12,
                padding: 10,
                borderRadius: 5,
                pointerEvents: 'all',
                fontWeight: 700,
                // everything inside EdgeLabelRenderer has no pointer events by default
                // if you have an interactive element, set pointer-events: all
              }}
              className=" nodrag nopan"
            >
              {props?.label}
            </div>
          </EdgeLabelRenderer>
          {/* <circle cx={toX} cy={toY} fill="#222" r={3} stroke="#222" strokeWidth={1.5} /> */}
        </>
      );
    }
  }
  return null
};

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


export const DecisionQuickRepliesActionEdge: FC<EdgeProps> = (
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
  }) => {
  const nodes = useNodes()
  const [edges, setEdges] = useEdgeContext()
  const [label, setLabel] = useState<string>('')


  const edge = useMemo(() => edges?.find((edge) => edge?.id === id), [edges, id])

  // do not render if 
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    // increase curvurture to differentiate duplicated edges
    curvature: 0.5 * parseInt(edge?.targetHandle?.replace(/\D/g, '') ?? '1', 10) + 1,
  });


  // set a node 
  useEffect(() => {
    if (edge) {
      const unusedLabel = getNextUnusedLabel(edges, nodes, 'quickReplies', edge)
      if (unusedLabel != null && edge?.label !== unusedLabel)
        updateEdges(
          { ...(edge?.data as object), label: unusedLabel },
          edge,
          edges,
          setEdges,
        );
      // check for any edges that are between the same defacto target handle and the exact same source handle
      // setDuplicateEdges(edges.filter(edgeIteration => {
      //   console.log(edge)
      //   // remove the number prefix from the target node id
      //   const edgeTargetHandleId = edge?.targetHandle?.replace(/[0-9]/g, '');
      //   const edgeIterationTargetHandleId = edgeIteration?.targetHandle?.replace(/[0-9]/g, '');

      //   // build new edge id 
      //   const newEdgeId = `reactflow__edge-${edge.source}-${edge.target}${edgeTargetHandleId}`
      //   const iterationEdgeId = `reactflow__edge-${edgeIteration.source}-${edge.target}${edgeIterationTargetHandleId}`
      //   console.log(newEdgeId, iterationEdgeId)

      //   // filter, get duplicates
      //   return newEdgeId === iterationEdgeId
      // }))
    }
  }, [edges?.length, id])

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20 * parseInt(edge?.targetHandle?.replace(/\D/g, '') ?? '1', 10) + 1}px)`,
            fontSize: 12,
            padding: 10,
            borderRadius: 5,
            pointerEvents: 'all',
            fontWeight: 700,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            // change curv
          }}
          className=" nodrag nopan"
        >
          {/* {label} */}
          {edge?.data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
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
      resolver: zodResolver(schema),
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
    // setError('message', node?.data?.errors?.message)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  useEffect(() => {
    updateNodes(getValues(), node, nodes, setNodes, errors)
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }




  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      {/* {actionNode(Action.DecisionQuickReplies)} */}
      {/* {tNodes(`Action.DecisionQuickReplies`)} */}
      {/* {node?.id} */}
      {/* <textarea className='w-full h-20 p-2 mx-4 bg-gray-200 resize-none gap-y-1 textarea' {...register("message")} /> */}
      <TextareaField fieldName={'message'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea' />
      {errors.message && <p className='justify-start text-xs text-red-500'>{errors.message.message}</p>}
      <div className='mb-10 divider'></div>
      {fields.map((field, index) => (
        <>
          <TextareaField fieldName={'quickReplies'} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
          {errors?.quickReplies?.[index] && <p className='justify-start mb-6 text-xs text-red-500'>{errors?.quickReplies?.[index]?.message}</p>}
        </>
      ))}
      <button onClick={() => append('New reply')} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button>
    </form >
  )
}


