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
import { BsPlus, BsX } from 'react-icons/bs';
import { FcFile, FcInfo, FcPicture } from 'react-icons/fc';
import {
    addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
    EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, NodeProps, Position, updateEdge,
    useEdges, useNodeId, useNodes, useUpdateNodeInternals
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
import { updateEdges } from '../updateEdges';
import { updateNodes } from '../updateNodes';

const schema = z.object({
  banner: z?.custom<FileList>()?.optional(),
  title: z.string()?.min(1),
  message: z.string()?.min(1),
  url: z.string().url().optional().or(z.literal('')),
  transferToOperatorMessage: z.boolean(),
  choices: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
  choiceLinks: z.array(z.string()?.optional()),
})

const type = Action.DecisionCardMessages

export type DecisionCardMessagesData = z.infer<typeof schema>
type FormValues = DecisionCardMessagesData

export const DecisionCardMessagesActionNode: FC<NodeProps> = (node) => {
  const [edges, setEdges] = useEdgeContext()
  const tNodes = useTranslations('dash.bots.nodes')

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  // (node?.data?.errors?.quickReplies ?? [])((quickReply: object | undefined) => quickReply);
  const hasErrors: boolean = node?.data?.errors?.message && node?.data?.errors?.quickReplies?.some((label: string) => label)
  const hasTooManyConnections: boolean = useMemo(() => nodeEdges?.length > node?.data?.quickReplies?.length, [nodeEdges?.length, node]);

  return (
    <div className={`w-16  `} >
      <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
      <NodeWrapper nodeElement={actionNode(type)} nodeName={tNodes(`Action.DecisionQuickReplies`)} hasErrors={hasErrors} hasTooManyConnections={hasTooManyConnections} />
      {createTargetHandles(node, nodeEdges, 'choices')}
    </div >
  )
}

export const DecisionCardMessagesActionEdge: React.FC<EdgeProps> = (params) => {
  return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
}

interface Props {
  node: Node
}

export const DecisionCardMessagesActionForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tDash = useTranslations('dash.bots')
  const [edges, setEdges] = useEdgeContext()
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const params = useParams();
  const ref = useRef(null)
  const [image, setImage] = useState<string>('')

  const tForm = useTranslations("dash.bots.ActionForms.DecisionCardMessages")
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
        title: '',
        banner: undefined,
        choices: [],
        choiceLinks: []
      },
      mode: 'onBlur',
    });



  const choicesFieldArray = useFieldArray({
    name: 'choices' as never,
    control, // control props comes from useForm (optional: if you are using FormContext)
  });
  const choiceLinksFieldArray = useFieldArray({
    name: 'choiceLinks' as never,
    control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const handleClickOutside = () => {
    // Your custom logic here
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)


  useEffect(() => {
    const apiValues: FormValues = node?.data
    console.log(apiValues?.banner)
    setValue('banner', apiValues?.banner)
    if (apiValues?.banner) {
      console.log(apiValues?.banner)
      setImage(URL?.createObjectURL(apiValues?.banner?.[0]));
    }
    setValue('title', apiValues?.title ?? tForm('defaultTitle'))
    setValue('message', apiValues?.message ?? tForm('defaultMessage'))
    setValue('url', apiValues?.url)
    setValue('choices', apiValues?.choices ?? [tForm('defaultReply1'), tForm('defaultReply2')])
    setValue('choiceLinks', apiValues?.choiceLinks ?? [])
    setValue('transferToOperatorMessage', apiValues?.transferToOperatorMessage ?? false)
    // setError('message', node?.data?.errors?.message)
    // setError('quickReplies', node?.data?.errors?.quickReplies)
  }, [node])

  // on error, set errors to nodes so they can be displayed on the node component
  useEffect(() => {
    console.log(errors)
    console.log(getValues())
  }, [errors])


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    console.log(values)
    onImageChange(values?.banner)
    updateNodes(values, node, nodes, setNodes)
  }

  // useEffect(() => {
  //   handleSubmit(onSubmit)
  // }, [])

  const onImageChange = (files: FileList | undefined) => {
    console.log(files)
    setImage(URL?.createObjectURL(files?.[0] as Blob))
  }


  return (
    <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
      {/* {actionNode(Action.DecisionQuickReplies)} */}
      {/* {tNodes(`Action.DecisionQuickReplies`)} */}
      {/* {node?.id} */}
      {/* <textarea className='w-full h-20 p-2 mx-4 bg-gray-200 resize-none gap-y-1 textarea' {...register("message")} /> */}
      <div className='flex flex-col justify-center p-2 border-[1px] border-black rounded-md shadow-lg'>
        <div className='relative w-full bg-gray-200/10 group' >
          {image && <BsX onClick={() => {
            setImage('')
          }} className='absolute top-0 right-0 z-10 invisible text-2xl hover:cursor-pointer group-hover:visible'></BsX>}
          <img src={image} className='w-full h-[160px] aspect-square'></img>
          <div className='flex flex-row'>
            <input type="file" accept=".jpg, .jpeg, .png, .pdf, .docx, .gif" className="w-full max-w-xs h-200 file-input file-input-sm input-ghost"  {...register('banner')} name={'banner'} />
            <FcPicture className='text-2xl' />
          </div>

        </div>
        {errors?.banner && <p className='justify-start text-xs text-error'>{errors?.banner?.message}</p>}
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">{tDecisionForm('Title')}</span>
          </label>
          <TextareaField fieldName={'title'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
        </div>
        {errors.title && <p className='justify-start text-xs text-error'>{errors?.title?.message}</p>}
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">{tForm("Message")}</span>
          </label>
          <TextareaField fieldName={'message'} node={node} setValue={setValue} handleSubmit={handleSubmit(onSubmit)} register={register} control={control} textareaStyle='text-sm bg-gray-200 w-full resize-none textarea focus:outline-0' />
        </div>
        {errors?.message && <p className='justify-start mb-6 text-xs text-error'>{errors?.message?.message}</p>}
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">url</span>
          </label>
          <input type='text' className='bg-gray-200 input input-sm' placeholder={tForm('urlPlaceholder')} {...register('url')} />
        </div>
        {errors?.url && <p className='justify-start mb-6 text-xs text-error'>{errors?.url?.message}</p>}
        <label className="cursor-pointer label">
          <span className="label-text">{tDecisionForm('Choices')}</span>
        </label>
        {choicesFieldArray.fields?.map((field, index) => (
          <div key={field.id} className="flex my-2 flex-row group shadow-md place-items-centers border-[1px] border-info p-6 rounded-full " onBlur={handleSubmit(onSubmit)}>
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
              console.log(value)
              setEdges(edges.filter((edge) => (edge?.data as { label: string })?.label !== value || edge.target !== node.id))
            }}></BsX>
            <div className='mb-1 divider'></div>
          </div>
        ))}
        <button onClick={() => {
          choicesFieldArray?.append(`${tForm('buttonNamePlaceholder')} ${choicesFieldArray.fields?.length}`)
          choiceLinksFieldArray?.append(`${tForm('urlPlaceholder')} ${choiceLinksFieldArray.fields?.length}`)
        }} className='justify-center mt-2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addButton')}</button>
        {/* <button onClick={() => append('New reply')} className='justify-center normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('addQuickReply')}</button> */}
        <span className="text-xs text-gray-200 label-text">{tDecisionForm("facebookCatch")}</span>
        <div className="form-control">
          <label className="cursor-pointer label ">
            <span className="label-text place-items-center">
              <div className="fixed z-10" data-tip={tDecisionForm("transferToOperatorMessageDescription")}>
                <FcInfo className='text-lg'></FcInfo>
              </div>
              {tDecisionForm("transferToOperatorMessageLabel")}
            </span>
            <input type="checkbox" className="toggle toggle-info"  {...register('transferToOperatorMessage')} onBlur={handleSubmit(onSubmit)} />
          </label>
        </div>
        {errors?.transferToOperatorMessage && <p className='justify-start text-xs text-red-500'>{errors?.transferToOperatorMessage?.message}</p>}
      </div>
    </form >
  )
}


