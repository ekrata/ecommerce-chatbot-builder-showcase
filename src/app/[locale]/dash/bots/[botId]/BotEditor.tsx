'use client'
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Action, Condition, OperatorInteractionTrigger, ShopifyAction, ShopifyCondition,
  VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { BiSave, BiTrash } from 'react-icons/bi';
import { BsInfo } from 'react-icons/bs';
import { MdOutlineArticle } from 'react-icons/md';
import ReactQuill from 'react-quill';
import ReactFlow, {
  addEdge, Controls, MiniMap, NodeTypes, useEdgesState, useNodesState
} from 'reactflow';

import ActionNode from '../(nodes)/ActionNode';
import ConditionNode from '../(nodes)/ConditionNode';
import TriggerNode from '../(nodes)/TriggerNode';
import { QueryKey } from '../../../(hooks)/queries';
import { useNotificationContext } from '../../NotificationProvider';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action'

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
}

const initNodes = [
  {
    id: '1',
    type: 'trigger',
    data: { name: 'Jane Doe', job: 'CEO', emoji: '😎' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'condition',
    data: { name: 'Tyler Weary', job: 'Designer', emoji: '🤓' },
    position: { x: -200, y: 200 },
  },
  {
    id: '3',
    type: 'action',
    data: { name: 'Kristi Price', job: 'Developer', emoji: '🤩' },
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

export const BotEditor: React.FC = () => {
  const searchParams = useSearchParams()
  const articleId = searchParams?.get('articleId')
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')
  const tNodes = useTranslations('dash.bots.nodes')

  const [nodeMenuState, setNodeMenuState] = useState<NodeMenuState>('')

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  console.log(edges)
  console.log(tNodes)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <div className="w-full h-screen p-2 bg-white" >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        elementsSelectable
        nodesConnectable
        nodesDraggable
        nodeTypes={nodeTypes}
        fitView
        className="w-full bg-teal-50"
      >
        <MiniMap />
        <Controls />
        <div className='absolute right-0'>
          <div className="h-screen-2/3 bg-white shadow-lg w-[600px] ">
            <ul className='flex flex-row menu dropdown-content'>
              <li onClick={() => setNodeMenuState('trigger')}><a>{tDash('Trigger')}</a></li>
              <li onClick={() => setNodeMenuState('condition')}><a>{tDash('Condition')}</a></li>
              <li onClick={() => setNodeMenuState('action')}><a>{tDash('Action')}</a></li>
            </ul>
            {nodeMenuState === 'trigger' &&
              <div>
                <ul className='flex flex-wrap'>
                  <p className='text-xl'>
                    {tBots('VisitorBotInteractionTrigger')}
                  </p>
                  <div className='flex flex-wrap'>
                    {Object.entries(VisitorBotInteractionTrigger).map(([key, value]) => (
                      <li><a>{tNodes(`VisitorBotInteractionTrigger.${key as VisitorBotInteractionTrigger}`)}</a></li>
                    ))}

                  </div>
                  <p className='text-xl'>
                    {tBots('VisitorPageInteractionTrigger')}
                  </p>
                  <div className='flex flex-wrap'>
                    {Object.entries(VisitorPageInteractionTrigger).map(([key, value]) => (
                      <li><a>{tNodes(`VisitorPageInteractionTrigger.${key as VisitorPageInteractionTrigger}`)}</a></li>
                    ))
                    }

                  </div>
                  <p className='text-xl'>
                    {tBots('OperatorInteractionTrigger')}
                  </p>

                  <div className='flex flex-wrap'>
                    {Object.entries(OperatorInteractionTrigger).map(([key, value]) => (
                      <li><a>{tNodes(`OperatorInteractionTrigger.${key as OperatorInteractionTrigger}`)}</a></li>
                    ))
                    }

                  </div>
                </ul>
              </div>
            }
            {nodeMenuState === 'condition' &&
              <div>
                <p>
                  {tBots('Conditions')}
                </p>
                {Object.entries(Condition).map(([key, value]) => (
                  <li><a>{tNodes(`Condition.${key as Condition}`)}</a></li>
                ))}
                {tBots('ShopifyCondition')}
                {Object.entries(ShopifyCondition).map(([key, value]) => (
                  <li><a>{tNodes(`Condition.${key as ShopifyCondition}`)}</a></li>
                ))
                }
              </div>
            }
            {nodeMenuState === 'action' &&
              <div>
                {
                  Object.entries(Action).map(([key, value]) => (
                    <li><a>{tNodes(`Action.${key as Action}`)}</a></li>
                  ))
                }
                {
                  Object.entries(ShopifyAction).map(([key, value]) => (
                    <li><a>{tNodes(`ShopifyAction.${key as ShoifyAction}`)}</a></li>
                  ))
                }
              </div>
            }
          </div>
        </div>
      </ReactFlow>
    </div>
  )
}