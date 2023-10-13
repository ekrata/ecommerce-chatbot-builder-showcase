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
  createContext, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState
} from 'react';
import ReactFlow, {
  addEdge, Background, BackgroundVariant, Connection, Controls, Edge, EdgeTypes, MiniMap, Node,
  OnSelectionChangeParams, Panel, ReactFlowInstance, ReactFlowProvider, useEdgesState,
  useNodesState, useOnSelectionChange
} from 'reactflow';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';
import { BotNodeType } from '@/entities/bot';

import CustomEdge from './CustomEdge';
import { actionNode, conditionNode, triggerNode } from './nodes';
import { formTypes, nodeTypes, renderNodeForm } from './nodes/nodeTypes';
import { updateNodes } from './nodes/updateNodes';
import { onDragStart } from './onDragStart';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action'

const initNodes: BotNodeType[] = [
  {
    id: '1',
    nodeType: 'trigger',
    nodeSubType: VisitorBotInteractionTrigger.VisitorClicksBotsButton,
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    nodeType: 'condition',
    nodeSubType: Condition.BasedOnContactProperty,
    position: { x: -200, y: 200 },
  },
  {
    id: '3',
    nodeType: 'action',
    nodeSubType: Action.AskAQuestion,
    position: { x: 200, y: 200 },
  },
];

const initEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
];

let id: number = 0;
const getId = () => `dndnode_${id++}`;

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const NodeContext = createContext<ReturnType<typeof useNodesState>>([[], () => null, () => null])
export const useNodeContext = () => useContext(NodeContext)

export const BotEditor: React.FC = () => {
  const ref = useRef(null)

  const params = useParams()
  const reactFlowWrapper = useRef(null);
  const [operatorSession] = useAuthContext();
  const orgId = operatorSession?.orgId ?? '';
  const botId = params?.botId as string ?? ''
  const bot = useBotQuery([orgId, botId]);
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')
  const tNodes = useTranslations('dash.bots.nodes')

  const [nodeMenuState, setNodeMenuState] = useState<NodeMenuState>('')
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<any, string | undefined> | null>(null)

  // const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState({
  //   items: nodes,
  // });

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

      updateNodes({}, newNode, nodes, setNodes)
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
  const debouncedValue = useDebounce<Node<any, string | undefined>[]>(nodes, 5000)

  // update whenever nodes array changes 
  useEffect(() => {
    const updateBot = async () => await updateBotMut.mutateAsync([orgId, botId, {
      ...bot?.data,
      nodes,
      edges
    }])
    updateBot()
  }, [nodes, edges])


  const render = useMemo(() => {
    return (
      <div className="w-full h-screen p-2 bg-white " ref={ref} >
        <NodeContext.Provider value={[nodes, setNodes, onNodesChange]}>
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
                <Controls />
                <Background variant={BackgroundVariant.Cross} className='-z-10' />
                <Panel position={'top-right'}>
                  <div className='absolute right-0 mb-40'>
                    <div className="h-screen-3/4  bg-white shadow-lg w-[400px] p-4 mb-40 pb-40 max-h-[900px] overflow-y-scroll rounded-lg">
                      {selectedNode?.type ?
                        <>
                          <h5 className='justify-center text-center'>{selectedNode?.type}</h5>
                          {renderNodeForm(selectedNode)}
                        </>
                        : (<>
                          <ul className='flex flex-row justify-between menu dropdown-content'>
                            <li onClick={() => setNodeMenuState('trigger')}><a>{tBots('Trigger')}</a></li>
                            <li onClick={() => setNodeMenuState('condition')}><a>{tBots('Condition')}</a></li>
                            <li onClick={() => setNodeMenuState('action')}><a>{tBots('Action')}</a></li>
                          </ul>
                          {nodeMenuState === 'trigger' &&
                            <div className=''>
                              <h5 className='mb-4 text-xl text-center'>
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
                              <h5 className='mb-4 text-xl text-center'>
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
                              <h5 className='mb-4 text-xl text-center'>
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
                              <h5 className='text-xl text-center'>
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
                              <h5 className='text-xl text-center'>
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
                              <h5 className='mb-4 text-xl text-center'>
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
                              <h5 className='mb-4 text-xl text-center'>
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
  }, [nodes, nodeMenuState])
  return render
}