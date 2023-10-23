import 'reactflow/dist/style.css';

import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import {
    Action, Condition, triggerInterval, VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
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

import { languageCodes } from '@/app/[locale]/(helpers)/lang';
import { conversationTopic } from '@/entities/conversation';
import { faker } from '@faker-js/faker';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNodeContext } from '../../BotEditor';
import {
    defaultOutputs, OutputFieldKey, OutputFieldsKeys, triggerNode, yesNoOutput
} from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { GenericEdge } from '../shared/GenericEdge';
import { TextareaField } from '../shared/TextareaField';
import { updateNodes } from '../updateNodes';

// const handleStyle = { left: 10 };

export const visitorSaysTopic = ['custom', 'greetings', 'criticism', 'gratitude', 'praise', ...conversationTopic] as const

const schema = z.object({
  conversationLanguage: z.enum(languageCodes),
  conversationTopic: z.enum(visitorSaysTopic),
  phrases: z.array(z.string()?.min(1)).optional().refine(items => new Set(items).size === items?.length, {
    message: 'Each option must be unique.',
  }),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type VisitorClicksOnChatIconData = z.infer<typeof schema>
type FormValues = VisitorClicksOnChatIconData

const type = VisitorBotInteractionTrigger.VisitorSays

export const VisitorSaysTriggerNode: FC<NodeProps> = (node) => {
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
      <NodeWrapper nodeElement={triggerNode(type)} nodeName={tNodes(`VisitorBotInteractionTrigger.VisitorSays`)} hasErrors={hasErrors} />
      {createTargetHandles(node, nodeEdges, outputKey)}
    </div >
  );
}

export const VisitorSaysTriggerEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const VisitorSaysTriggerForm: React.FC<Props> = ({ node }) => {
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
        phrases: [faker.helpers.arrayElement([tForm('phrase1'), tForm('phrase2')])]
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
    setValue('conversationLanguage', apiValues?.conversationLanguage ?? 'en')
    setValue('conversationTopic', apiValues?.conversationTopic ?? 'custom')
    setValue('phrases', apiValues?.phrases ?? [])
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
          <span className="label-text">{tForm('conversationLanguage')}</span>
        </label>
        <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm"  {...register('conversationLanguage')}>
          {languageCodes?.map((lang) => (
            <option key={lang} label={tLanguageCodes(lang)} value={lang}></option>
          ))}
        </select>
        <label className="label">
          <span className="label-text">{tForm('conversationTopic')}</span>
        </label>
        <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm"  {...register('conversationTopic')}>
          {visitorSaysTopic?.map((topic) => (
            <option key={topic} label={tVisitorSaysTopic(topic)} value={topic}></option>
          ))}
        </select>
        <label className="label">
          <span className="inline-flex text-xs ">{tForm('phraseDescription')} <FcInfo className='flex text-4xl' /></span>
        </label>
        {errors?.phrases && <p className='justify-start mb-6 text-xs text-error'>{errors?.phrases?.message}</p>}
        {fields.map((field, index) => (
          <>
            <TextareaField fieldName={'phrases'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray} register={register} control={control} />
            {errors?.phrases?.[index] && <p className='justify-start mb-6 text-xs text-error'>{errors?.phrases?.[index]?.message}</p>}
          </>
        ))}
        <button onClick={() => append(tForm('phrase1'))} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addPhrase')}</button>
      </div>
    </form >
  )
}


