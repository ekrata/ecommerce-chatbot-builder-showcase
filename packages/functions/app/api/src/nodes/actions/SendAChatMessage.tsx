// import EmojiPicker, {
//     Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
//     SuggestionMode, Theme
// } from 'emoji-picker-react';
// import { c } from 'msw/lib/glossary-de6278a9';
// import { useTranslations } from 'next-intl';
// import { useParams, useSearchParams } from 'next/navigation';
// import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
// import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
// import {
//     FieldErrors, FieldValues, Resolver, SubmitHandler, useFieldArray, useForm, UseFormSetValue
// } from 'react-hook-form';
// import { BsPlus } from 'react-icons/bs';
// import {
//     addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
//     EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, Position, useEdges, useNodeId,
//     useNodes
// } from 'reactflow';
// import { useOnClickOutside } from 'usehooks-ts';
// import { z } from 'zod';

// import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
// import { useUpdateBotMut } from '@/src/app/[locale]/(hooks)/mutations/useUpdateBotMut';
// import { useBotQuery } from '@/src/app/[locale]/(hooks)/queries/useBotQuery';
// import { useNodeContext } from '@/src/app/[locale]/dash/(root)/bots/[botId]/BotEditor';
// import {
//     actionNode, defaultOutputs, OutputFieldsKeys
// } from '@/src/app/[locale]/dash/(root)/bots/[botId]/collections';
// import { NodeWrapper } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/NodeWrapper';
// import { updateNodes } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/updateNodes';
// import { zodResolver } from '@hookform/resolvers/zod';

// import { createTargetHandles } from '../shared/createTargetHandles';
// import { GenericEdge } from '../shared/GenericEdge';
// import { TextareaField } from '../shared/TextareaField';

// const schema = z.object({
//   messages: z.array(z.string()?.min(1)),
//   outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
//     message: 'Each option must be unique.',
//   }),
// })

// export type SendAChatMessageData = z.infer<typeof schema>
// type FormValues = SendAChatMessageData

// const type = Action.SendAChatMessage

// export const SendAChatMessageActionNode = (node: Node) => {
//   const outputKey = OutputFieldsKeys[type]
//   const edges = useEdges()
//   const tNodes = useTranslations('dash.bots.nodes')

//   const hasErrors: boolean = node?.data?.errors?.messages?.some((content: object | undefined) => content)

//   // prevent nodes from connecting when edge count exceeds quick reply decision count.
//   const nodeEdges = useMemo<Edge[]>(() => (
//     edges?.filter((edge) => edge?.target === node.id)
//   ), [edges]);

//   return (
//     <div className={`w-16 animate-fade `} >
//       <Handle type="source" position={Position.Top} className='w-3 h-3 mask mask-diamond' />
//       <NodeWrapper nodeElement={actionNode(Action.SendAChatMessage)} nodeName={tNodes(`Action.SendAChatMessage`)} hasErrors={hasErrors} />
//       {createTargetHandles(node, nodeEdges, outputKey)}
//     </div >
//   );
// }

// export const SendAChatMessageActionEdge: React.FC<EdgeProps> = (params) => {
//   return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
// }

// interface Props {
//   node: Node
// }

// export const SendAChatMessageActionForm: React.FC<Props> = ({ node }) => {
//   const tNodes = useTranslations('dash.bots.nodes')
//   const tDash = useTranslations('dash.bots')
//   const [operatorSession] = useAuthContext()
//   const [nodes, setNodes, onNodesChange] = useNodeContext()
//   const orgId = operatorSession?.orgId ?? ''
//   const params = useParams();
//   const botId = params?.botId as string
//   const ref = useRef(null)

//   const tForm = useTranslations("dash.bots.ActionForms.SendAChatMessage")
//   const { register,
//     handleSubmit,
//     control,
//     watch,
//     setValue,
//     getValues,
//     setError,
//     formState: { errors }, } = useForm<FormValues>({
//       resolver: zodResolver(schema),
//       defaultValues: {
//         messages: [],
//         outputs: defaultOutputs
//       },
//       mode: 'onBlur',
//     });

//   const fieldArray = useFieldArray({
//     name: 'messages' as never,
//     control, // control props comes from useForm (optional: if you are using FormContext)
//   });

//   const handleClickOutside = () => {
//     // Your custom logic here
//     console.log('clicked outside')
//     updateNodes(getValues(), node, nodes, setNodes)
//   }

//   useOnClickOutside(ref, handleClickOutside)

//   const { fields, append, update, prepend, remove, swap, move, insert } = fieldArray

//   useEffect(() => {
//     const apiValues: FormValues = node?.data
//     setValue('messages', apiValues?.messages ?? tForm('defaultMessage'))
//     setValue('outputs', apiValues?.outputs ?? defaultOutputs)
//   }, [node])

//   // on error, set errors to nodes so they can be displayed on the node component
//   useEffect(() => {
//     updateNodes(getValues(), node, nodes, setNodes, errors)
//   }, [errors])

//   const onSubmit: SubmitHandler<FormValues> = async (values) => {
//     updateNodes(values, node, nodes, setNodes)
//   }

//   return (
//     <form className='flex flex-col place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
//       <div className='mb-10 divider'></div>
//       {fields.map((field, index) => (
//         <div key={field.id}>
//           <TextareaField key={field.id} node={node} fieldName={'messages'} setValue={setValue as any} handleSubmit={handleSubmit(onSubmit)} index={index} fieldArray={fieldArray as any} register={register as any} control={control as any} />
//           {errors?.messages?.[index] && <p className='justify-start mb-6 text-xs text-red-500'>{errors?.messages?.[index]?.message}</p>}
//         </div>
//       ))}
//       <button onClick={() => append(tForm('New message'))} className='justify-center w-1/2 normal-case join-item btn btn-outline btn-sm'><BsPlus className='text-xl' />{tForm('New message')}</button>
//     </form >
//   )
// }
