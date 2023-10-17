import 'reactflow/dist/style.css';

import {
    Action, VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { ComponentType, ReactElement } from 'react';
import {
    ConnectionLineComponent, ConnectionLineComponentProps, ConnectionLineType, Edge, EdgeTypes,
    Node, NodeTypes
} from 'reactflow';

import { Actions, Conditions, Triggers } from '@/entities/bot';

import { nodeSubTypeIcons } from '../nodeSubTypeIcons';
import {
    DecisionQuickRepliesActionConnection, DecisionQuickRepliesActionEdge,
    DecisionQuickRepliesActionForm, DecisionQuickRepliesActionNode
} from './nodes/actions/DecisionQuickReplies';
import {
    SendAChatMessageActionForm, SendAChatMessageActionNode
} from './nodes/actions/SendAChatMessage';
import { getNextUnusedLabel } from './nodes/shared/getNextUnusedLabel';
import {
    VisitorClicksBotsButtonForm, VisitorClicksBotsButtonTriggerNode
} from './nodes/triggers/VisitorClicksBotsButtonTrigger';
import { onDragStart } from './onDragStart';

export const conditionNode = (value: Conditions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-warning pointer-grab gap-x-2 btn btn-outline mask mask-diamond' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Conditions]}
  </a>
)

export const triggerNode = (value: Triggers) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-success pointer-grab gap-x-2 btn btn-outline mask mask-circle' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Triggers]}
  </a>
)

export const actionNode = (value: Actions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-info pointer-grab gap-x-2 btn btn-outline mask mask-squircle' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Actions]}
  </a>
)

export const nodeTypes: NodeTypes = {
  [`${VisitorBotInteractionTrigger.VisitorClicksBotsButton}`]: VisitorClicksBotsButtonTriggerNode,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  // [`${Condition.BasedOnContactProperty}`]: BasedOnContactPropertyConditionNode,
  // [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionNode,
  [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
};



export const connectionLineTypes: {
  [key: string]: ComponentType<ConnectionLineComponentProps>;
} = {
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionConnection,
}


export const renderConnectionLine = (params: ConnectionLineComponentProps, edges: Edge[], nodes: Node[]) => {
  if (params?.fromNode?.id && params?.fromNode?.type) {
    switch (params?.fromNode?.type) {
      case Action.DecisionQuickReplies: {
        const nodeFormLabels = params?.fromNode?.data?.quickReplies
        console.log(nodeFormLabels)
        const unusedLabel = getNextUnusedLabel(edges, params?.fromNode?.id, nodeFormLabels)
        console.log(edges)
        if (unusedLabel) {
          return <DecisionQuickRepliesActionConnection params={params} label={unusedLabel} />
        }
      }
    }
  }
  return null
}

export const edgeTypes: EdgeTypes = {
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionEdge,
}


interface Props {
  node: Node
}

export const NodeForm: React.FC<Props> = ({ node }) => {
  switch (node.type) {
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesActionForm node={node} />
    case Action.SendAChatMessage:
      return <SendAChatMessageActionForm node={node} />
    case VisitorBotInteractionTrigger.VisitorClicksBotsButton:
      return <VisitorClicksBotsButtonForm node={node} />

    default:
      return null
  }
}



