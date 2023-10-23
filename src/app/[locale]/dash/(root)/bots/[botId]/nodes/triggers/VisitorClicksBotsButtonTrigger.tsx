import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
    Action, VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { FC, useEffect, useMemo, useRef } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import { Edge, Handle, Node, NodeProps, Position, useEdges, useNodeId } from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';

import TriggerNode from '../../../(nodes)/TriggerNode';
import { useNodeContext } from '../../BotEditor';
import { actionNode, OutputFieldKey, OutputFieldsKeys, triggerNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { createTargetHandles } from '../shared/createTargetHandles';
import { updateNodes } from '../updateNodes';

const schema = z.object({
  buttonName: z.string()?.min(1),
  outputs: z.array(z.string()?.min(1)).refine(items => new Set(items).size === items.length, {
    message: 'Each option must be unique.',
  }),
})

type VisitorClicksBotsButtonData = z.infer<typeof schema>
type FormValues = VisitorClicksBotsButtonData

const type = VisitorBotInteractionTrigger.VisitorClicksChatIcon

export const VisitorClicksBotsButtonTriggerNode: FC<NodeProps> = (node) => {
  const outputKey = OutputFieldsKeys[type]
  const edges = useEdges()
  const tNodes = useTranslations('dash.bots.nodes')
  const nodeId = useNodeId()

  // prevent nodes from connecting when edge count exceeds quick reply decision count.
  const nodeEdges = useMemo<Edge[]>(() => (
    edges?.filter((edge) => edge?.target === node.id)
  ), [edges]);

  return (<div className={`w-16 animate-fade `}>
    <Handle type="target" position={Position.Left} id="a" className="w-2 h-2" />
    <NodeWrapper nodeElement={triggerNode(VisitorBotInteractionTrigger.VisitorClicksBotsButton)} nodeName={tNodes(`VisitorBotInteractionTrigger.VisitorClicksBotsButton`)} hasErrors={node?.data?.errors?.buttonName} />
    {createTargetHandles(node, nodeEdges, outputKey)}
  </div >
  );
}




interface Props {
  node: Node
}

export const VisitorClicksBotsButtonForm: React.FC<Props> = ({ node }) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const tBots = useTranslations('dash.bots')
  const tDash = useTranslations('dash')
  const [operatorSession] = useAuthContext()
  const [nodes, setNodes, onNodesChange] = useNodeContext()
  const orgId = operatorSession?.orgId ?? ''
  const params = useParams();

  const botId = params?.botId as string
  const ref = useRef(null)

  const tForm = useTranslations("dash.bots.TriggerForms.VisitorClicksBotsButton")
  const { register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        buttonName: '',
      },
      mode: 'onBlur',
    });

  const handleClickOutside = () => {
    // Your custom logic here
    console.log('clicked outside')
    updateNodes(getValues(), node, nodes, setNodes)
  }

  useOnClickOutside(ref, handleClickOutside)

  useEffect(() => {
    const apiValues: FormValues = node?.data
    setValue('buttonName', apiValues?.buttonName)
    setError('buttonName', node?.data?.errors?.buttonName)

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
      <div className="w-full max-w-xs form-control">
        <label className="label">
          <span className="label-text">{tForm('fieldLabel')}</span>
        </label>
        <input type='text' className='w-full bg-gray-200 gap-y-1 input-sm' {...register("buttonName")} placeholder={tForm('placeholder')} onBlur={handleSubmit(onSubmit)} />
        {errors.buttonName && <p className='justify-start text-xs text-red-500'>{errors.buttonName?.message}</p>}
      </div>
      <div className='mb-10 divider'></div>
    </form >
  )
}


