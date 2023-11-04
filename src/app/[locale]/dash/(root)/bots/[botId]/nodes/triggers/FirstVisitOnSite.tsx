import 'reactflow/dist/style.css';

import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import { FcInfo } from 'react-icons/fc';
import {
  Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position,
  updateEdge, useEdges, useNodeId, useNodes
} from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { conversationTopic } from '@/entities/conversation';
import {
  VisitorPageInteractionTrigger
} from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { languageCodes } from '@/src/app/[locale]/(helpers)/lang';
import { faker } from '@faker-js/faker';
import { zodResolver } from '@hookform/resolvers/zod';

import { OutputFieldsKeys } from '../../../outputFields';
import { useNodeContext } from '../../BotEditor';
import { defaultOutputs, triggerNode, yesNoOutput } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

export const visitorSaysTopic = ['custom', 'greetings', 'criticism', 'gratitude', 'praise', ...conversationTopic] as const

const schema = z.object({
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

export type FirstVisitOnSiteData = z.infer<typeof schema>
type FormValues = FirstVisitOnSiteData

const type = VisitorPageInteractionTrigger.FirstVisitOnSite

export const FirstVisitOnSiteTriggerNode: FC<NodeProps> = (node) => {
  const outputKey = OutputFieldsKeys[type as keyof typeof OutputFieldsKeys]
  const edges = [...useEdges()];
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.[outputKey]?.some((label: string) => label)

  return (
    <div className={`w-16 place-items-center  `} >
      <NodeWrapper nodeElement={triggerNode(type)} nodeName={tNodes(`VisitorPageInteractionTrigger.FirstVisitOnSite`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}

export const FirstVisitOnSiteTriggerEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type as keyof typeof OutputFieldsKeys]} />
}

interface Props {
  node: Node
}

export const FirstVisitOnSiteTriggerForm: React.FC<Props> = ({ node }) => {
  const [nodes, setNodes] = useNodeContext()
  const ref = useRef(null)

  const tDash = useTranslations("dash")
  const tForm = useTranslations("dash.bots.TriggerForms.VisitorSays")
  const tLanguageCodes = useTranslations('dash.bots.languageCodes')
  const tVisitorSaysTopic = useTranslations('dash.bots.visitorSaysTopic')
  const { register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        outputs: defaultOutputs,
      },
      mode: 'onBlur',
    });

  const handleClickOutside = () => {
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  const fieldArray = useFieldArray({
    name: 'phrases' as never,
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray


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
      <div className="w-full max-w-xs form-control gap-y-2">
        <label className="label">
          <span className="label-text">{tDash('No configuration required')}</span>
        </label>
      </div>
    </form >
  )
}


