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
import {
  FieldErrors, Path, Resolver, SubmitHandler, useFieldArray, useForm
} from 'react-hook-form';
import { BsPlus, BsX } from 'react-icons/bs';
import { FcInfo } from 'react-icons/fc';
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

import { useEdgeContext, useNodeContext } from '../../BotEditor';
import { actionNode, OutputFieldsKeys } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { filterByEdgeTargetHandle } from '../shared/filterByEdgeTargetHandle';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };



const schema = z.object({
  message: z.string()?.min(1),
  transferToOperatorMessage: z.boolean(),
  choiceLinks: z.array(z.string()?.optional()),
  choices: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

const type = Action.DecisionButtons

export type DecisionButtonsData = z.infer<typeof schema>
type FormValues = DecisionButtonsData

export const DecisionButtonsActionNode = (node: Node) => {
  const [edges, setEdges] = useEdgeContext()
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  // (node?.data?.errors?.quickReplies ?? [])((quickReply: object | undefined) => quickReply);
  const hasErrors: boolean = node?.data?.errors?.message && node?.data?.errors?.quickReplies?.some((label) => label)
  const hasTooManyConnections: boolean = useMemo(() => nodeEdges?.length > node?.data?.quickReplies?.length, [nodeEdges?.length, node]);

  return (
    <div className={`w-16  `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.DecisionButtons`)} hasErrors={hasErrors} hasTooManyConnections={hasTooManyConnections} />
      {createTargetHandles(node, nodeEdges, OutputFieldsKeys[type])}
    </div >
  )
}

export const DecisionButtonsActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const DecisionButtonsActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [edges, setEdges] = useEdgeContext()
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();
  const botId = params?.botId as string
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.ActionForms.DecisionButtons")
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
        choiceLinks: [],
        choices: []
      },
      mode: 'onBlur',
    });



  const choicesFieldArray = useFieldArray({
    name: 'choices',
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const choiceLinksFieldArray = useFieldArray({
    name: 'choiceLinks',
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const handleClickOutside = () => {
    // Your custom logic here
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('message', apiValues?.message ?? tForm('messagePlaceholder'))
    setValue('choiceLinks', apiValues?.choiceLinks ?? [tForm('urlPlaceholder')])
    setValue('choices', apiValues?.choices ?? [tForm('buttonNamePlaceholder')])
    // setError('message', node?.data?.errors?.message)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  // useEffect(() => {

  // }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    updateNodes(values, node, nodes, setNodes)
  }

  // useEffect(() => {
  //   handleSubmit(onSubmit)
  // }, [])



  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <TextareaField fieldName={'message'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
      {errors.message && <p className='justify-start text-xs text-error'>{errors.message.message}</p>}
      <div className='mb-10 divider'></div>

      <label className="cursor-pointer label">
        <span className="label-text">{tDecisionForm('Choices')}</span>
      </label>
      {choicesFieldArray.fields?.map((field, index) => (
        <div key={field.id} className="flex flex-row group place-items-centers shadow-md border-[1px] border-info p-6 rounded-full ">
          <div className="w-full max-w-xs form-control gap-y-2">
            <input type="text" placeholder={tForm('buttonNamePlaceholder')} {...register(`choices.${index}`)} className="w-full max-w-xs bg-gray-200 input-sm input focus:outline-0" />
            {errors?.choices && <p className='justify-start mb-1 text-xs text-error'>{errors?.choices?.message}</p>}
            <input type="text" placeholder={tForm('urlPlaceholder')} {...register(`choiceLinks.${index}`)} className="w-full max-w-xs bg-gray-200 input-sm input focus:outline-0" />
            {errors?.choiceLinks && <p className='justify-start mb-1 text-xs text-error'>{errors?.choiceLinks?.message}</p>}
          </div>
          <BsX className='invisible text-2xl hover:cursor-pointer group-hover:visible' onClick={() => {
            const value = getValues().choices[index]

            choicesFieldArray?.remove(index)
            choiceLinksFieldArray?.remove(index)
            // remove respective edge
            setEdges(edges.filter((edge) => edge?.data?.label !== value || edge.target !== node.id))
          }}></BsX>

          <div className='mb-1 divider'></div>

        </div>
      ))}
      <button onClick={() => {
        choicesFieldArray?.append(`${tForm('buttonNamePlaceholder')} ${choicesFieldArray.fields?.length}`)
        choiceLinksFieldArray?.append(`${tForm('urlPlaceholder')} ${choiceLinksFieldArray.fields?.length}`)
      }} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addButton')}</button>
      <span className="text-xs text-gray-200 label-text">{tDecisionForm("facebookCatch")}</span>
      <div className=" form-control">
        <label className="flex flex-row cursor-pointer label gap-x-2">
          <span className="flex label-text place-items-center">
            <div className="tooltip" data-tip={tDecisionForm("transferToOperatorMessageDescription")}>
              <FcInfo className='text-lg'></FcInfo>
            </div>
            {tDecisionForm("transferToOperatorMessageLabel")}
          </span>
          <input type="checkbox" className="toggle"  {...register('transferToOperatorMessage')} />
        </label>
      </div>
      {errors?.transferToOperatorMessage && <p className='justify-start text-xs text-red-500'>{errors?.transferToOperatorMessage?.message}</p>}

    </form >
  )
}


