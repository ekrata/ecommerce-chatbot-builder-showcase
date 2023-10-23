// import 'reactflow/dist/style.css';

// import EmojiPicker, {
//   Categories, Emoji, EmojiClickData, EmojiStyle, SkinTonePickerLocation, SkinTones,
//   SuggestionMode, Theme
// } from 'emoji-picker-react';
// import { c } from 'msw/lib/glossary-de6278a9';
// import { useTranslations } from 'next-intl';
// import { useParams, useSearchParams } from 'next/navigation';
// import { Action, Condition } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
// import { FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
// import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
// import { BsPlus } from 'react-icons/bs';
// import { FcInfo } from 'react-icons/fc';
// import {
//   addEdge, BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, Edge,
//   EdgeLabelRenderer, EdgeProps, getBezierPath, Handle, Node, Position, updateEdge, useEdges,
//   useNodeId, useNodes
// } from 'reactflow';
// import { useOnClickOutside } from 'usehooks-ts';
// import { z } from 'zod';

// import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
// import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
// import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
// import { validationType } from '@/entities/bot';
// import { contactProperties, contactSelector } from '@/entities/customer';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useEdgeContext, useNodeContext } from '../../BotEditor';
// import {
//   actionNode, conditionNode, defaultOutputs, OutputFieldsKeys, yesNoOutput
// } from '../../collections';
// import { NodeWrapper } from '../NodeWrapper';
// import { createTargetHandles } from '../shared/createTargetHandles';
// import { GenericEdge } from '../shared/GenericEdge';
// import { TextareaField } from '../shared/TextareaField';
// import { updateEdges } from '../updateEdges';
// import { updateNodes } from '../updateNodes';

// // const handleStyle = { left: 10 };




// const schema = z.object({
//   fieldName: z.enum(contactProperties),
//   fieldSelector: z.enum(contactSelector),
//   fieldValue: z.string()?.min(1)?.optional(),
//   outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
//     message: 'Each option must be unique.',
//   }),
// })

// type FormValues = z.infer<typeof schema>

// const type = Condition.BasedOnContactProperty

// export const BasedOnContactPropertyConditionNode = (node: Node) => {
//   const outputKey = OutputFieldsKeys[type]
//   const edges = [...useEdges()];
//   const tNodes = useTranslations('dash.bots.nodes')

//   // prevent nodes from connecting when edge count exceeds quick reply decision count.
//   const nodeEdges = useMemo<Edge[]>(() => (
//     edges?.filter((edge) => edge?.target === node.id)
//   ), [edges]);

//   const hasErrors: boolean = node?.data?.errors?.message || node?.data?.errors?.[outputKey]?.some((label) => label)

//   return (
//     <div className={`w-16 place-items-center  `} >
//       <Handle type="source" position={Position.Top} className='w-3 h-3 left-[48.5%] place-items-center mask mask-diamond' />
//       <NodeWrapper nodeElement={conditionNode(type)} nodeName={tNodes(`Condition.BasedOnContactProperty`)} hasErrors={hasErrors} />
//       {createTargetHandles(node, nodeEdges, outputKey)}
//     </div >
//   );
// }


// export const BasedOnContactPropertyConditionEdge: React.FC<EdgeProps> = (params) => {
//   return <GenericEdge {...params} outputKey={OutputFieldsKeys[type]} />
// }

// interface Props {
//   node: Node
// }

// export const BasedOnContactPropertyConditionForm: React.FC<Props> = ({ node }) => {
//   const [nodes, setNodes] = useNodeContext()
//   const ref = useRef(null)

//   const tDash = useTranslations("dash")
//   const tForm = useTranslations("dash.bots.ConditionForms.BasedOnContactProperty")
//   const tContactProperties = useTranslations('dash.bots.contactProperties')
//   const tContactSelectors = useTranslations('dash.bots.contactSelectors')
//   const { register,
//     handleSubmit,
//     control,
//     setValue,
//     getValues,
//     formState: { errors }, } = useForm<FormValues>({
//       resolver: zodResolver(schema),
//       defaultValues: {
//         outputs: yesNoOutput
//       },
//       mode: 'onBlur',
//     });

//   const handleClickOutside = () => {
//     updateNodes(getValues(), node, nodes, setNodes)
//   }

//   useOnClickOutside(ref, handleClickOutside)


//   useEffect(() => {
//     const apiValues: FormValues = node?.data
//     setValue('fieldName', apiValues?.fieldName)
//     setValue('fieldSelector', apiValues?.fieldSelector)
//     setValue('fieldValue', apiValues?.fieldValue)
//     setValue('outputs', apiValues?.outputs ?? yesNoOutput)
//     // setError('quickReplies', node?.data?.errors?.quickReplies)
//   }, [node])

//   // on error, set errors to nodes so they can be displayed on the node component
//   useEffect(() => {
//     console.log(errors)
//     updateNodes(getValues(), node, nodes, setNodes, errors)
//   }, [errors])


//   const onSubmit: SubmitHandler<FormValues> = async (values) => {
//     updateNodes(values, node, nodes, setNodes)
//   }

//   const selectorHasValue = contactSelector


//   return (
//     <form className='flex flex-col mx-6 mt-6 place-items-center form gap-y-4' onSubmit={handleSubmit(onSubmit)} ref={ref}>
//       <div className="w-full max-w-xs form-control gap-y-2">
//         <label className="label">
//           <span className="label-text">{tForm('Contact Property')}</span>
//         </label>
//         <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm" {...register('fieldName')}>
//           {contactProperties?.map((property) => (
//             <option key={property} label={tContactProperties(property)} value={property}></option>
//           ))}
//         </select>

//         <label className="label">
//           <span className="label-text">{tForm('Contact Selector')}</span>
//         </label>

//         <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm" {...register('fieldSelector')}>
//           {contactSelector.map((selector) => (
//             <option key={selector} label={tContactSelectors(selector)} value={selector}></option>
//           ))}
//         </select>

//         {getValues()?.fieldSelector !== 'isSet' &&
//           <div>
//             <label className="label">
//               <span className="label-text">{tDash('Value')}</span>
//             </label>
//             <input type="text" className="w-full max-w-xs bg-gray-200 input-sm input input-ghost" {...register('fieldValue')} />
//           </div>}
//         {errors?.fieldValue && <p className='justify-start text-xs text-error'>{errors?.fieldValue?.message}</p>}
//       </div>
//     </form >
//   )
// }


