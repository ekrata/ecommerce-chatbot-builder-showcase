'use client'
// import '../../../../../../tailwind-config.js';


import './index.css';
import 'reactflow/dist/style.css';

import { isEqual } from 'lodash';
import { Link, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import {
  createContext, Dispatch, DragEventHandler, SetStateAction, useCallback, useContext, useEffect,
  useMemo, useRef, useState
} from 'react';
import { useForm } from 'react-hook-form';
import { BiLoaderAlt, BiTestTube, BiTrash, BiX } from 'react-icons/bi';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import { toast } from 'react-toastify';
import ReactFlow, {
  addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection,
  ConnectionLineComponentProps, Controls, Edge, EdgeTypes, Node, OnSelectionChangeParams, Panel,
  ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState
} from 'reactflow';
import { useDebounce } from 'use-debounce';
import { z } from 'zod';

import {
  actions, botCategory, BotNodeEvent, BotNodeType, conditions, triggers
} from '@/entities/bot';
import {
  Action, Agent, Condition, OperatorInteractionTrigger, ShopifyAction, ShopifyCondition,
  VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from '@/packages/functions/app/api/src/bots/triggers/definitions.type';
import { ConfirmationModal } from '@/src/app/[locale]/(components)/ConfirmationModal';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { useDeleteBotMut } from '@/src/app/[locale]/(hooks)/mutations/useDeleteBotMut';
import { useUpdateBotMut } from '@/src/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/src/app/[locale]/(hooks)/queries/useBotQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { OutputFieldKey, OutputFieldsKeys } from '../outputFields';
import { agentGradients } from './agentGradients';
import {
  actionNode, agentNode, conditionNode, edgeTypes, nodeTypes, renderConnectionLine, triggerNode
} from './collections';
import { getNodeForm } from './getNodeForm';
import { getNextUnusedLabel } from './nodes/shared/getNextUnusedLabel';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action' | 'agent'

let id: number = 0;
const getId = () => `dndnode_${id++}`;


type NodeContextType = [...ReturnType<typeof useNodesState>, ...ReturnType<typeof useState<Node | null>>]
const NodeContext = createContext<NodeContextType>([[], () => null, () => null, null, () => null])

type EdgeContextType = [...ReturnType<typeof useEdgesState>]
const EdgeContext = createContext<EdgeContextType>([[], () => null, () => null])

export const useNodeContext = () => useContext(NodeContext)
export const useEdgeContext = () => useContext(EdgeContext)

const schema = z.object({
  active: z?.boolean(),
  name: z.string().min(1),
  category: z.enum(botCategory)
})


export type BotEditorData = z.infer<typeof schema>
type FormValues = BotEditorData


export const BotEditor: React.FC = () => {
  const ref = useRef(null)
  useEffect(() => {
    console.log(nodeTypes)
  }, [nodeTypes])

  const nodeTypesMemo = useMemo(
    () => nodeTypes,
    [],
  );

  const edgeTypesMemo = useMemo(
    () => edgeTypes,
    [],
  );


  const router = useRouter()
  const params = useParams()
  const reactFlowWrapper = useRef<HTMLInputElement>(null);
  const [operatorSession] = useAuthContext();
  const orgId = operatorSession?.orgId ?? '';
  const botId = params?.botId as string ?? ''

  const botQuery = useBotQuery([orgId, botId]);
  const deleteBotMut = useDeleteBotMut(orgId)
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')
  const tNodes = useTranslations('dash.bots.nodes')

  const [nodeMenuState, setNodeMenuState] = useState<NodeMenuState>('')

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: any) => {
      console.log('noded')
      return setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [setNodes])

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );


  const { register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }, } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        active: botQuery?.data?.active ?? false,
        name: botQuery?.data?.name,
        category: botQuery?.data?.category
      },
      mode: 'onBlur',
    });



  // const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState<{ nodes: Node[], edges: Edge[] }>({
  //   ...nodes,
  //   ...edges
  // });

  const [selectedFormNode, setSelectedFormNode] = useState<Node | null>(null)


  // useEffect(() => {
  //   if (botQuery?.data?.nodes != null && Array.isArray(botQuery?.data?.nodes)) {
  //     setNodes([...botQuery?.data?.nodes])
  //     console.log(nodes)
  //   }
  //   if (botQuery?.data?.edges != null && Array.isArray(botQuery?.data?.edges)) {
  //     setEdges([...(botQuery?.data?.edges)])
  //   }
  // }, [botQuery?.dataUpdatedAt])

  const connectionLineStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  }

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<any, any> | null>(null);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect() as any;
    // const position = reactFlowInstance?.project({
    //   x: event.clientX - reactFlowBounds.left,
    //   y: event.clientY - reactFlowBounds.top,
    // }) ?? { x: 0, y: 0 }
    // // const selectedNodes = nodes.filter((node) => node?.selected);
    // setNodes([...nodes.map((node) => {
    //   if (node.selected) {
    //     return { ...node, position }
    //   }
    //   return node
    // }
    // )]);
  }, [nodes, reactFlowInstance]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams): void => {
    const selectedNodes = nodes?.filter(({ selected }) => selected)
    console.log(selectedNodes)
    if (selectedNodes?.length) {
      console.log(selectedNodes)
      // console.log(newNode, selectedFormNode)
      setSelectedFormNode(selectedNodes?.[0])
    } else {
      setSelectedFormNode(null)
      // setNodes([...nodes.map((node) => ({
      //   ...node, selected: false
      // }))])
    }
  }, [nodes, reactFlowInstance])



  const onPaneClick = (event: any) => {
    event.preventDefault()
    console.log('onPaneClick')
    setNodes([...nodes?.map((node) => {
      return { ...node, selected: false }
    })])
    setSelectedFormNode(null)
    nodes

    // console.log(nodes, selectedFormNode)
  };

  useEffect(() => {
    console.log(botQuery.dataUpdatedAt)
    const restoreFlow = async () => {
      if (botQuery?.data) {
        // const { x = 0, y = 0, zoom = 1 } = botQuery.data?.viewport;
        console.log(botQuery?.data?.nodes)
        setNodes(botQuery?.data?.nodes as Node[] ?? []);
        setEdges(botQuery?.data?.edges as Edge[] ?? []);
        setValue('name', botQuery?.data?.name ?? '')
        setValue('active', botQuery?.data?.active ?? false)
        setValue('category', botQuery?.data?.category ?? 'General')
      }
    };
    restoreFlow();
  }, [botQuery.dataUpdatedAt]);

  const onDrop = useCallback(
    async (event: any, clonedNode?: Node): Promise<DragEventHandler<HTMLDivElement> | undefined> => {
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect() as any;
      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }) ?? { x: 0, y: 0 }
      let nextNodeId = '0'
      if (nodes?.length) {
        const nodeIds = nodes?.map(({ id }) => {
          return parseInt(id, 10)
        })
        nextNodeId = ((Math.max(...nodeIds)) + 1).toString()
      }
      if (clonedNode) {
        console.log(clonedNode?.position)
        const newClonedNode: Node = {
          id: nextNodeId,
          type: clonedNode?.type,
          data: clonedNode?.data,
          // at mouse pos
          position: { x: clonedNode?.position.x - 50, y: clonedNode?.position?.y - 50 }
        };
        // await toast.promise(() => new Promise(() => { success: `Copied a ${clonedNode?.type}` }), { position: 'bottom-right' })
        setNodes([...nodes, newClonedNode]);
        return

      }
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const newNode: Node = {
        id: nextNodeId,
        type,
        data: {},
        position,
      };
      setNodes([...nodes, newNode]);

      // setSelectedFormNode([newNode as Node])
    },
    [reactFlowInstance, nodes, edges]
  );

  const onConnect = useCallback((params: Connection | Edge, clonedEdge?: Edge) => setEdges((eds) => {
    const nodeTarget = nodes?.find((node) => node.id === params?.target)

    // Outputs is not bound to a field count, so we allow the user to draw infinite lines by programmatically creating new outputs
    // (and subsequently, handles) when a connection is successful, here.
    // if (nodeTarget?.type) {
    //   const arrayKey = OutputFieldsKeys[nodeTarget.type]
    //   if (arrayKey === 'outputs') {
    //     console.log('adding output')
    //     const max = Math.max(...nodeTarget?.data?.[arrayKey].map((i: string) => Number(i)))
    //     console.log(max)
    //     console.log(nodeTarget?.data?.[arrayKey])
    //     const updatedNode = { ...nodeTarget, data: { ...nodeTarget?.data, outputs: [...nodeTarget?.data?.[arrayKey], (max + 1).toString()] } }
    //     console.log(updatedNode)
    //     setNodes([...nodes.filter((node) => node?.id !== params?.target), updatedNode])
    //   }
    // }

    const node = nodes?.find((node) => node.id === params?.target)
    // prevent nodes from connecting when edge count exceeds quick reply decision count.
    if (nodeTarget?.type) {
      const outputKey = OutputFieldsKeys?.[nodeTarget?.type as OutputFieldKey]
      if (node?.data?.[outputKey] && params?.target && nodeTarget?.type) {
        const label = getNextUnusedLabel(edges, params?.target, node?.data?.[outputKey])
        return addEdge({
          ...params,
          type: nodeTarget?.type,
          data: { label },
        }, eds)
      }
      return addEdge({
        ...params,
        label: 'new edge'
      }, eds)
    }
    return eds
  }), [nodes, edges]);

  const updateBotMut = useUpdateBotMut(orgId)

  const [debouncedNodes, set] = useDebounce(nodes, 5000, { equalityFn: isEqual })
  const [debouncedEdges] = useDebounce<Edge[]>(edges, 5000, { equalityFn: isEqual })

  useEffect(() => {
    if (reactFlowInstance) {
      const { active, name, category } = getValues()
      const updateBody = {
        ...botQuery?.data,
        nodes: nodes as any,
        edges: edges as any,
        name,
        active,
        category
      }
      delete updateBody?.botId
      delete updateBody?.orgId
      const updateBot = async () => await updateBotMut.mutateAsync([orgId, botId, updateBody])
      updateBot()
    }
  }, [debouncedEdges, debouncedNodes, getValues()?.active, getValues()?.name, getValues()?.category])



  // const updateBotCallback = () => {
  //   console.log('update')
  //   console.log('hi')
  //   console.log(nodes)
  //   console.log(edges)
  //   const { active, name, category } = getValues()
  //   const updateBody = {
  //     ...botQuery?.data,
  //     nodes: nodes as any,
  //     edges: edges as any,
  //     name,
  //     active,
  //     category
  //   }
  //   delete updateBody?.botId
  //   delete updateBody?.orgId
  //   const updateBot = async () => await updateBotMut.mutateAsync([orgId, botId, updateBody])
  //   updateBot()
  // }

  // const debouncedUpdateBotHandler = useMemo(() => {
  //   return debounce(updateBotCallback, 5000)
  // }, [debouncedNodes, debouncedEdges, getValues()?.active, getValues()?.name, getValues()?.category])

  // // Stop the invocation of the debounced function
  // // after unmounting
  // useEffect(() => {
  //   return () => {
  //     debouncedUpdateBotHandler.cancel();
  //   }
  // }, []);

  // debouncedUpdateBotHandler()

  const [keyboardState, setKeyboardState] = useState('');
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

  const handleKeyDown = useCallback((event: any) => {
    // event.preventDefault();
    const code = event.which || event.keyCode;

    let charCode = String.fromCharCode(code).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      setKeyboardState('CTRL+S');
      // alert('CTRL+S Pressed');
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'c') {
      setKeyboardState('CTRL+C');
      console.log(nodes)
      setCopiedNodes(nodes?.filter((node) => node?.selected));
      setCopiedEdges(edges?.filter((edge) => edge?.selected))
      console.log(copiedNodes)
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'v') {
      setKeyboardState('CTRL+V');
      copiedNodes?.map((copiedNode) => {
        onDrop(event, copiedNode)
      })
      copiedNodes?.map((copiedNode) => {
        onDrop(event, copiedNode)
      })
    }
  }, [nodes, edges])
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderNodeForm = useCallback(() => {
    if (selectedFormNode) {
      const selectedNode = selectedFormNode
      return getNodeForm(selectedNode, undefined, selectedNode?.type ? agentGradients[selectedNode.type as BotNodeEvent] ?? '' : undefined)
    }
  }, [selectedFormNode])

  const onDelete = async () => {
    const res = await toast.promise(() => deleteBotMut.mutateAsync([orgId, botId]), {
      pending: tDash('Deleting'),
      success: tDash('Deleted'),
      error: tDash('Failed to delete')
    }, { position: 'bottom-right' })

    router.push(`/dash/bots` as never)
  }

  const onConnectionLine = useCallback((params: ConnectionLineComponentProps) => (
    renderConnectionLine(params, edges)
  ), [nodes, edges])


  return (
    <div className="w-full h-screen p-2 bg-white " ref={ref} >
      <NodeContext.Provider value={[nodes, setNodes, onNodesChange, selectedFormNode, setSelectedFormNode as Dispatch<SetStateAction<Node | null | undefined>>]}>
        <EdgeContext.Provider value={[edges, setEdges, onEdgesChange]}>
          <ReactFlowProvider>
            <div className="h-screen reactflow-wrapper" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                defaultViewport={botQuery?.data?.viewport}
                elementsSelectable
                onPaneClick={onPaneClick}
                onSelectionChange={onSelectionChange}
                nodesConnectable
                nodesDraggable
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypesMemo}
                edgeTypes={edgeTypesMemo}
                onDrop={onDrop}
                onDragOver={onDragOver}
                attributionPosition='bottom-left'
                connectionLineComponent={onConnectionLine}
                fitView
                className=""
                ref={ref}
              >
                {/* <MiniMap /> */}
                <Panel position="top-left">
                  {botQuery?.isLoading && !updateBotMut?.isLoading && <div className='flex bg-transparent place-items-center gap-x-2'><BiLoaderAlt className='animate-spin' />{tDash('Fetching')}</div>}
                  {/* {botQuery?.isSuccess && <div className='flex bg-transparent place-items-center gap-x-2'><FcCheckmark />{tDash('Loaded')}</div>} */}
                  {updateBotMut?.isLoading && <div className='flex bg-transparent place-items-center gap-x-2'><BiLoaderAlt className='animate-spin' />{tDash('Saving')}</div>}
                  {updateBotMut?.isSuccess && <div className='flex bg-transparent place-items-center gap-x-2'><FcCheckmark />{tDash('Saved')}</div>}
                  {updateBotMut?.isError && <div className='flex bg-transparent place-items-center gap-x-2' > <FcCancel />{tDash('Error')}</div>}
                </Panel>

                {/* <Panel position="bottom-right">
                    <div className='flex flex-row bg-white shadow-2xl place-items-center'>
                      <div className="tooltip" data-tip={tDash('Undo')}>
                        <button disabled={!canUndo} className="link" onClick={undo}>
                          <BiUndo className={`text-3xl ${!canUndo && 'text-gray-200'}`} />
                        </button>
                      </div>
                      <div className="tooltip" data-tip={tDash('Redo')}>
                        <button disabled={!canRedo} className="link" onClick={redo}>
                          <BiRedo className={`text-3xl ${!canRedo && 'text-gray-200'}`} />
                        </button>
                      </div>
                    </div>
                  </Panel> */}
                <Controls />
                <Background variant={BackgroundVariant.Cross} className='-z-100' />
                <Panel position={'top-right'} className='right-0 justify-end z-1'>
                  <div className='right-0 flex flex-row justify-end w-full place-items-center gap-x-4'>
                    <label className="w-full cursor-pointer label gap-x-2">
                      {/* <span className="label-text">{tDash('Active')}</span> */}
                      <input type="text" className="w-full bg-gray-200 input input-sm"   {...register('name')} onChange={() => null} />
                    </label>
                    <label className="w-full cursor-pointer label gap-x-2">
                      <select className="w-full max-w-xs bg-gray-200 select select-ghost select-sm" {...register('category')} >
                        {botCategory?.map((item) =>
                          <option key={item}>{item}</option>
                        )}
                      </select>
                    </label>
                    <div className="form-control">
                      <label className="w-full cursor-pointer label gap-x-2">
                        <span className="label-text">{getValues()?.active ? tDash('Active') : tDash('Disabled')}</span>
                        <input type="checkbox" className="toggle toggle-info" {...register('active')} />
                      </label>
                    </div>
                    <Link href={{ pathname: "/dash/sandbox" }} rel="noopener noreferrer" target="_blank" className='flex normal-case rounded-md btn btn-info btn-sm gap-x-2'>

                      <BiTestTube className={`text-lg`} />
                      {tDash('Test')}
                    </Link>
                    <ConfirmationModal actionLabel={tDash('Are you sure you want to delete this?')} leftButtonAction={async () => await onDelete()} leftButtonLabel={tDash('Delete')} rightButtonLabel={tDash('Cancel')} leftButtonColor={'error'}>
                      <button className="flex normal-case rounded-md btn btn-error btn-sm" >
                        <div className='flex flex-row w-full place-items-center gap-x-3'>
                          <BiTrash />
                          {tDash('Delete')}
                        </div>
                      </button>
                    </ConfirmationModal>
                  </div>
                </Panel>
                <Panel position={'top-right'}>
                  <div className='absolute right-0 mt-4 mb-40 group'>
                    <div className={`   bg-white/75  backdrop-blur-xl shadow-lg  mb-40 mt-10 ${(nodeMenuState || selectedFormNode) && 'animate-fade w-[360px] pb-20 h-[650px]'}  ${!nodeMenuState && 'my-8 pb-0'} overflow-y-scroll rounded-lg`}>
                      {selectedFormNode ?
                        renderNodeForm()
                        : (<>
                          <ul className='flex flex-row justify-between text-xs place-items-center tabs tabs-boxed '>
                            <li className={`tab  ${nodeMenuState === 'trigger' && 'tab-active'}`} onClick={() => setNodeMenuState('trigger')}><a >{tBots('Trigger')}</a></li>
                            <li className={`tab  ${nodeMenuState === 'condition' && 'tab-active'}`} onClick={() => setNodeMenuState('condition')}><a >{tBots('Condition')}</a></li>
                            <li className={`tab  ${nodeMenuState === 'action' && 'tab-active'}`} onClick={() => setNodeMenuState('action')}><a >{tBots('Action')}</a></li>
                            <li className={`tab  ${nodeMenuState === 'agent' && 'tab-active'}`} onClick={() => setNodeMenuState('agent')}><a >{tBots('Agent')}</a></li>
                            {nodeMenuState !== '' && <button className='button btn-ghost'><BiX className='text-3xl' onClick={() => setNodeMenuState('')} /></button>}
                          </ul>
                          {nodeMenuState === 'trigger' &&
                            <div className=''>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('VisitorBotInteractionTrigger')}
                              </h5>
                              <ul className='grid justify-around grid-cols-12 mb-8 gap-x-6 gap-y-2'>
                                {Object.entries(VisitorBotInteractionTrigger).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {triggerNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`VisitorBotInteractionTrigger.${key as VisitorBotInteractionTrigger}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('VisitorPageInteractionTrigger')}
                              </h5>
                              <ul className='grid flex-wrap justify-around grid-cols-12 mb-8 gap-x-6 gap-y-2'>
                                {Object.entries(VisitorPageInteractionTrigger).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {triggerNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`VisitorPageInteractionTrigger.${key as VisitorPageInteractionTrigger}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('OperatorInteractionTrigger')}
                              </h5>
                              <ul className='grid flex-wrap justify-around grid-cols-12 gap-x-6 gap-y-2'>
                                {Object.entries(OperatorInteractionTrigger).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {triggerNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`OperatorInteractionTrigger.${key as OperatorInteractionTrigger}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          }
                          {nodeMenuState === 'condition' &&
                            <div>
                              <h5 className='text-lg text-center'>
                                {tBots('Conditions')}
                              </h5>
                              <ul className='grid flex-wrap justify-around grid-cols-12 gap-x-6 gap-y-2'>
                                {...Object.entries(Condition).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {conditionNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`Condition.${key}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                              <h5 className='text-lg text-center'>
                                {tBots('ShopifyCondition')}
                              </h5>
                              <ul className='flex flex-wrap justify-around gap-x-6 gap-y-2'>
                                {...Object.entries(ShopifyCondition).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center gap-y-2 place-items-center'>
                                    <a className='flex flex-row w-16 h-16 p-2 text-3xl normal-case bg-warning pointer-grab gap-x-2 btn btn-outline mask mask-diamond' draggable>
                                      {conditionNode(value)}
                                    </a>
                                    <p className="text-xs font-light">
                                      {tNodes(`ShopifyCondition.${key}` as any)}
                                    </p>
                                  </li>
                                ))
                                }
                              </ul>
                            </div>
                          }
                          {nodeMenuState === 'action' &&
                            <div className=''>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('Action')}
                              </h5>
                              <ul className='grid justify-around grid-cols-12 mb-8 gap-x-6 gap-y-2'>
                                {Object.entries(Action).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {actionNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`Action.${key as Action}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('ShopifyAction')}
                              </h5>
                              <ul className='grid justify-around grid-cols-12 mb-8 gap-x-6 gap-y-2'>
                                {Object.entries(ShopifyAction).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {actionNode(value)}
                                    <p className="text-xs font-light">
                                      {tNodes(`ShopifyAction.${key as Action}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>

                            </div>
                          }
                          {nodeMenuState === 'agent' &&
                            <div className=''>
                              <h5 className='mb-4 text-lg text-center'>
                                {tBots('Agent')}
                              </h5>
                              <ul className='grid justify-around grid-cols-12 mb-8 gap-x-6 gap-y-2'>
                                {Object.entries(Agent).map(([key, value]) => (
                                  <li className='flex flex-col flex-wrap justify-center col-span-6 gap-y-2 place-items-center'>
                                    {agentNode(value, 'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700')}
                                    <p className="text-xs font-light">
                                      {tNodes(`Agent.${key as Agent}` as any)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          }
                        </>)}
                    </div>
                  </div>
                </Panel>
              </ReactFlow >
            </div >
          </ReactFlowProvider >
        </EdgeContext.Provider >
      </NodeContext.Provider >
    </div >
  )
}