'use client'
// import '../../../../../../tailwind-config.js';


import './index.css';
import 'reactflow/dist/style.css';

import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Action, Condition, OperatorInteractionTrigger, ShopifyAction, ShopifyCondition,
  VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import {
  createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef,
  useState
} from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import ReactFlow, {
  addEdge, Background, BackgroundVariant, Connection, Controls, Edge, EdgeTypes, MiniMap, Node,
  OnSelectionChangeParams, Panel, ReactFlowInstance, ReactFlowProvider, useEdgesState,
  useNodesState, useOnSelectionChange
} from 'reactflow';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import { isEquivalentArray } from '@/app/[locale]/(helpers)/isEquivalentArray';
import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
import { BotNodeType } from '@/entities/bot';

import CustomEdge from './CustomEdge';
import { actionNode, conditionNode, triggerNode } from './nodes';
import { NodeForm } from './nodes/NodeForm';
import { formTypes, nodeTypes, renderNodeForm } from './nodes/nodeTypes';
import { updateNodes } from './nodes/updateNodes';
import { onDragStart } from './onDragStart';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action'

let id: number = 0;
const getId = () => `dndnode_${id++}`;

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

type NodeContextType = [...ReturnType<typeof useNodesState>, ...ReturnType<typeof useState<Node | null>>]
const NodeContext = createContext<NodeContextType>([[], () => null, () => null, null, () => null])
export const useNodeContext = () => useContext(NodeContext)

export const BotEditor: React.FC = () => {
  const ref = useRef(null)

  const params = useParams()
  const reactFlowWrapper = useRef(null);
  const [operatorSession] = useAuthContext();
  const orgId = operatorSession?.orgId ?? '';
  const botId = params?.botId as string ?? ''
  const botQuery = useBotQuery([orgId, botId]);
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')
  const tNodes = useTranslations('dash.bots.nodes')

  const [nodeMenuState, setNodeMenuState] = useState<NodeMenuState>('')

  const [nodes, setNodes, onNodesChange] = useNodesState(botQuery?.data?.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(botQuery?.data?.edges as Edge[]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)


  useEffect(() => {
    console.log('setting')
    console.log(botQuery?.data?.nodes)
    setNodes(botQuery?.data?.nodes as Node[] ?? [])
    setEdges(botQuery?.data?.edges as Edge[] ?? [])
  }, [botQuery?.dataUpdatedAt])

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


      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode as Node)
    },
    [reactFlowInstance]
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
    return addEdge({
      ...params,
      label: 'new edge'
    }, eds)
  }), []);

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

  const renderNodeForm = useCallback(() => {
    if (selectedNode) {
      return (
        <>
          <h5 className='justify-center text-center'>{selectedNode?.type}</h5>
          <NodeForm node={selectedNode} />
        </>
      )
    }
  }, [selectedNode?.id])

  return (
    <div className="w-full h-screen p-2 bg-white " ref={ref} >
      <NodeContext.Provider value={[nodes, setNodes, onNodesChange, selectedNode, setSelectedNode as Dispatch<SetStateAction<Node | null | undefined>>]}>
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
      </NodeContext.Provider >
    </div >
  )
}