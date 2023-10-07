'use client'
import 'react-quill/dist/quill.snow.css';

import { useTranslations } from 'next-intl';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { BiSave, BiTrash } from 'react-icons/bi';
import { BsInfo } from 'react-icons/bs';
import { MdOutlineArticle } from 'react-icons/md';
import ReactQuill from 'react-quill';
import ReactFlow, {
  addEdge, Controls, MiniMap, NodeTypes, useEdgesState, useNodesState
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import {
  useCreateArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useCreateArticleContentMut';
import { useCreateArticleMut } from '@/app/[locale]/(hooks)/mutations/useCreateArticleMut';
import {
  useDeleteArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useDeleteArticleContentMut';
import { useDeleteArticleMut } from '@/app/[locale]/(hooks)/mutations/useDeleteArticleMut';
import {
  useUpdateArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useUpdateArticleContentMut';
import { useUpdateArticleMut } from '@/app/[locale]/(hooks)/mutations/useUpdateArticleMut';
import {
  getArticleWithContent
} from '@/app/[locale]/chat-widget/(actions)/orgs/articles/getArticleWithContent';
import { ArticleCategory, articleCategory, articleStatus, ArticleStatus } from '@/entities/article';
import { useQuery } from '@tanstack/react-query';

import ActionNode from '../../(nodes)/ActionNode';
import ConditionNode from '../../(nodes)/ConditionNode';
import TriggerNode from '../../(nodes)/TriggerNode';
import { QueryKey } from '../../../../(hooks)/queries';
import { useNotificationContext } from '../../../NotificationProvider';
import { NodeSelector } from './NodeSelector';

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

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  console.log(edges)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const renderContent = useMemo(() => {
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
          className="bg-teal-50"
        >
          <MiniMap />
          <Controls />
          <NodeSelector />
        </ReactFlow>
      </div>
    )
  }, [])

  return <div>{renderContent}</div>
}
