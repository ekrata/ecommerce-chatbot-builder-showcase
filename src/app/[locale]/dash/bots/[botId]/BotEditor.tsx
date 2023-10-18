'use client'
// import '../../../../../../tailwind-config.js';


import './index.css';
import 'reactflow/dist/style.css';

import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Action, Condition, OperatorInteractionTrigger, ShopifyAction, ShopifyCondition,
    VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import {
    createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef,
    useState
} from 'react';
import { BiLoaderAlt, BiRedo, BiTrash, BiUndo } from 'react-icons/bi';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import { toast } from 'react-toastify';
import ReactFlow, {
    addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection,
    ConnectionLineComponent, Controls, Edge, EdgeTypes, MiniMap, Node, NodeTypes,
    OnConnectStartParams, OnSelectionChangeParams, Panel, ReactFlowInstance, ReactFlowProvider,
    useEdges, useEdgesState, useNodesState, useOnSelectionChange
} from 'reactflow';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useDeleteBotMut } from '@/app/[locale]/(hooks)/mutations/useDeleteBotMut';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
import { actions, BotNodeType, conditions, triggers } from '@/entities/bot';
import { useHistoryState } from '@uidotdev/usehooks';

import { nodeSubTypeIcons, SubNodeType } from '../nodeSubTypeIcons';
import {
    actionNode, conditionNode, connectionLineTypes, edgeTypes, getConnectionLineComponent, NodeForm,
    nodeTypes, renderConnectionLine, triggerNode
} from './collections';
import { DecisionQuickRepliesActionConnection } from './nodes/actions/DecisionQuickReplies';
import { getNextUnusedLabel } from './nodes/shared/getNextUnusedLabel';
import { updateNodes } from './nodes/updateNodes';
import { onDragStart } from './onDragStart';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action'

let id: number = 0;
const getId = () => `dndnode_${id++}`;




type NodeContextType = [...ReturnType<typeof useNodesState>, ...ReturnType<typeof useState<Node | null>>]
const NodeContext = createContext<NodeContextType>([[], () => null, () => null, null, () => null])

type EdgeContextType = [...ReturnType<typeof useEdgesState>]
const EdgeContext = createContext<EdgeContextType>([[], () => null, () => null])

export const useNodeContext = () => useContext(NodeContext)
export const useEdgeContext = () => useContext(EdgeContext)

export const BotEditor: React.FC = () => {
  const ref = useRef(null)
  const edgeUpdateSuccessful = useRef(true);

  const router = useRouter()
  const params = useParams()
  const reactFlowWrapper = useRef(null);
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
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState<{ nodes: Node[], edges: Edge[] }>({
  //   ...nodes,
  //   ...edges
  // });

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [connectionLineComponent, setConnectionLineComponent] = useState<ConnectionLineComponent | undefined>(undefined);


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

  const onConnectStart = useCallback((event: _, params: OnConnectStartParams) => {
    const node = nodes.find((node) => node.id === params.nodeId)
    if (node?.type) {
      setConnectionLineComponent(connectionLineTypes[node?.type as string])
    } else {
      setConnectionLineComponent(undefined)
    }
  }, [nodes, edges])

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<any, any> | null>(null);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onPaneClick = () => {
    setSelectedNode(null)
  };


  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }) ?? { x: 0, y: 0 }


      const newNode: Node = {
        id: getId(),
        type,
        data: {},
        position,
      };

      setNodes([...nodes, newNode]);
      setSelectedNode(newNode as Node)
    },
    [reactFlowInstance, nodes, edges]
  );

  const onSelectionChange = (params: OnSelectionChangeParams): void => {
    if (params?.nodes?.[0]) {
      setSelectedNode(params?.nodes?.[0])
    }
    else {
      setSelectedNode(null)
    }
  }

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => {
    const nodeTarget = nodes?.find((node) => node.id === params?.target)
    if (nodeTarget?.type) {
      return addEdge({
        ...params,
        type: nodeTarget?.type,
      }, eds)
    } else {
      return addEdge({
        ...params,
        label: 'new edge'
      }, eds)
    }
  }), [nodes, edges]);

  useEffect(() => {
    console.log(edges)
  }, [edges])

  const updateBotMut = useUpdateBotMut(orgId)

  // update api with node/edges changes at most every 5 seconds
  const debouncedNodes = useDebounce<Node<any, string>[]>(nodes, 5000)
  const debouncedEdges = useDebounce<Edge[]>(edges, 5000)

  // update whenever nodes array changes 
  useEffect(() => {
    // && isEquivalentArray(botQuery?.data?.nodes, debouncedNodes) && isEquivalentArray(botQuery?.data?.edges, debouncedEdges)
    if (botQuery?.data?.nodes && botQuery?.data?.edges && reactFlowInstance) {
      const updateBot = async () => await updateBotMut.mutateAsync([orgId, botId, {
        ...botQuery?.data,
        nodes: nodes as any,
        edges: edges,
      }])
      updateBot()
    }
  }, [debouncedNodes, debouncedEdges])

  // update history on change
  // useEffect(() => {
  //   console.log('setting history')
  //   console.log('history prior: ', state)
  //   console.log(nodes)
  //   set({ nodes, edges })
  //   console.log('history now: ', state)
  // }, [debouncedNodes, debouncedEdges])


  // // update real node state on undo/redo
  // useEffect(() => {
  //   console.log('setting real')
  //   console.log('real prior: ', nodes)
  //   setNodes(nodes)
  //   setEdges(edges)
  //   console.log('real now: ', nodes)
  // }, [redo, undo])

  const renderNodeForm = useCallback(() => {
    if (selectedNode) {
      return (
        <>
          <h5 className='flex flex-row justify-center lex-between place-items-center gap-x-2'>
            {triggers.includes(selectedNode.type as any) && <div className="flex flex-row w-4 h-4 text-xl normal-case border-0 place-items-center bg-success gap-x-2 btn btn-outline mask mask-circle">
              <div className='text-xl'>
                {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
              </div>
            </div>}
            {conditions.includes(selectedNode.type as any) && <div className="flex flex-row w-1 h-1 text-xl normal-case border-0 bg-warning gap-x-2 btn btn-outline mask mask-diamond">
              <div className='text-xl'>
                {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
              </div>
            </div>}
            {actions.includes(selectedNode.type as any) && <div className="flex flex-row w-1 h-1 text-xl normal-case border-0 bg-info gap-x-2 btn btn-outline mask mask-squircle">

              <div className='text-xl'>
                {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
              </div>
            </div>}
            {selectedNode?.type}
          </h5>
          <NodeForm node={selectedNode} />
        </>
      )
    }
  }, [selectedNode?.id])

  const onDelete = async () => {
    const res = await toast.promise(() => deleteBotMut.mutateAsync([orgId, botId]), {
      pending: tDash('Deleting'),
      success: tDash('Deleted'),
      error: tDash('Failed to delete')
    }, { position: 'bottom-right' })
    router.push(`/dash/bots`)
  }


  return (
    <div className="w-full h-screen p-2 bg-white " ref={ref} >
      <NodeContext.Provider value={[nodes, setNodes, onNodesChange, selectedNode, setSelectedNode as Dispatch<SetStateAction<Node | null | undefined>>]}>
        <EdgeContext.Provider value={[edges, setEdges, onEdgesChange]}>
          <ReactFlowProvider>
            <div className="h-screen reactflow-wrapper" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                elementsSelectable
                onSelectionChange={({ nodes, edges }) => onSelectionChange({ nodes, edges })}
                nodesConnectable
                nodesDraggable
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                onDrop={onDrop}
                onDragOver={onDragOver}
                edgeTypes={edgeTypes}
                onPaneClick={onPaneClick}
                attributionPosition='bottom-left'
                onConnectStart={onConnectStart}
                connectionLineComponent={(params) => renderConnectionLine(params, edges, nodes)}
                fitView
                className=""
                ref={ref}
              >
                {/* <MiniMap /> */}
                <Panel position="top-left">
                  {botQuery?.isLoading && !updateBotMut?.isLoading && <div className='flex bg-transparent place-items-center gap-x-2'><BiLoaderAlt className='animate-spin' />{tDash('Fetching')}</div>}
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
                <Panel position="top-center">
                  <div className='flex flex-row bg-white shadow-2xl place-items-center'>
                    <button onClick={onDelete} className="flex normal-case btn btn-error btn-outline btn-sm" >
                      <BiTrash className={`text-xl`} />
                      {tDash('Delete')}
                    </button>
                  </div>
                </Panel>
                <Controls />
                <Background variant={BackgroundVariant.Cross} className='-z-10' />
                <Panel position={'top-right'}>
                  <div className='absolute right-0 mb-40'>
                    <div className="h-screen-3/4  bg-white shadow-lg w-[360px] p-4 mb-40 mt-10 pb-40 h-[800px] overflow-y-scroll rounded-lg">
                      {selectedNode ?
                        renderNodeForm()
                        : (<>
                          <ul className='flex flex-row justify-between mb-10 tabs tabs-boxed'>
                            <li className={`tab  ${nodeMenuState === 'trigger' && 'tab-active'}`} onClick={() => setNodeMenuState('trigger')}><a >{tBots('Trigger')}</a></li>
                            <li className={`tab  ${nodeMenuState === 'condition' && 'tab-active'}`} onClick={() => setNodeMenuState('condition')}><a >{tBots('Condition')}</a></li>
                            <li className={`tab  ${nodeMenuState === 'action' && 'tab-active'}`} onClick={() => setNodeMenuState('action')}><a >{tBots('Action')}</a></li>
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
                                      {tNodes(`VisitorBotInteractionTrigger.${key as VisitorBotInteractionTrigger}`)}
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
                                      {tNodes(`VisitorPageInteractionTrigger.${key as VisitorPageInteractionTrigger}`)}
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
                                      {tNodes(`OperatorInteractionTrigger.${key as OperatorInteractionTrigger}`)}
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
                                      {tNodes(`Condition.${key}`)}
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
                                    <a className='flex flex-row w-16 h-16 p-2 text-3xl normal-case bg-warning pointer-grab gap-x-2 btn btn-outline mask mask-diamond' onDragStart={(event) => onDragStart(event, 'input')} draggable>
                                      {conditionNode(value)}
                                    </a>
                                    <p className="text-xs font-light">
                                      {tNodes(`ShopifyCondition.${key}`)}
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
                                      {tNodes(`Action.${key as Action}`)}
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
                                      {tNodes(`ShopifyAction.${key as Action}`)}
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