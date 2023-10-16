import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  Action, VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { useEffect, useMemo, useRef } from 'react';
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import { Edge, Handle, Node, Position, useNodeId } from 'reactflow';
import { useOnClickOutside } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';

import TriggerNode from '../../../(nodes)/TriggerNode';
import { useNodeContext } from '../../BotEditor';
import { actionNode, triggerNode } from '../../collections';
import { NodeWrapper } from '../NodeWrapper';
import { updateNodes } from '../updateNodes';

type FormValues = {
  buttonName: string
}

export const VisitorClicksBotsButtonTriggerNode = (node: Node, edges: Edge[]) => {
  const tNodes = useTranslations('dash.bots.nodes')
  const nodeId = useNodeId()

  return (<div className={`w-16 animate-fade `}>
    <Handle type="target" position={Position.Left} id="a" className="w-2 h-2" />
    <NodeWrapper nodeElement={triggerNode(VisitorBotInteractionTrigger.VisitorClicksBotsButton)} nodeName={tNodes(`VisitorBotInteractionTrigger.VisitorClicksBotsButton`)} hasErrors={node?.data?.errors?.buttonName} />
    <Handle type="target" position={Position.Right} id="b" className='w-2 h-2' onConnect={(params) => console.log('handle onConnect', params)} />
    <Handle type="target" position={Position.Top} id="d" className='w-2 h-2' onConnect={(params) => console.log('handle onConnect', params)} />
  </div >
  );
}

const resolver: Resolver<FormValues> = async (values) => {
  const errors: FieldErrors<FormValues> = { buttonName: undefined }
  if (!values?.buttonName) {
    errors.buttonName = {
      type: 'required',
      message: "Can't be empty"
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
      resolver,
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


