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
    AskAQuestionActionEdge, AskAQuestionActionForm, AskAQuestionActionNode
} from './nodes/actions/AskAQuestion';
import {
    CouponCodeActionEdge, CouponCodeActionForm, CouponCodeActionNode
} from './nodes/actions/CouponCode';
import {
    DecisionQuickRepliesActionConnection, DecisionQuickRepliesActionEdge,
    DecisionQuickRepliesActionForm, DecisionQuickRepliesActionNode
} from './nodes/actions/DecisionQuickReplies';
import {
    SendAChatMessageActionForm, SendAChatMessageActionNode
} from './nodes/actions/SendAChatMessage';
import {
    SubscribeForMailingEdge, SubscribeForMailingForm, SubscribeForMailingNode
} from './nodes/actions/SubscribeForMailing';
import { GenericConnectionLine } from './nodes/shared/genericConnectionLine';
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
  [`${Action.AskAQuestion}`]: AskAQuestionActionNode,
  [`${Action.CouponCode}`]: CouponCodeActionNode,
  [`${Action.SubscribeForMailing}`]: SubscribeForMailingNode,
  [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
};



export const connectionLineTypes: {
  [key: string]: ComponentType<ConnectionLineComponentProps>;
} = {
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionConnection,
}


export const OutputFieldsKeys = {
  [`${Action.AskAQuestion}`]: 'outputs',
  [`${Action.CouponCode}`]: 'outputs',
  [`${Action.DecisionQuickReplies}`]: 'quickReplies',
}

export const renderConnectionLine = (params: ConnectionLineComponentProps, edges: Edge[], nodes: Node[]) => {
  if (params?.fromNode?.id && params?.fromNode?.type) {
    const nodeFormLabels = params?.fromNode?.data?.[OutputFieldsKeys[params?.fromNode?.type]]
    const unusedLabel = getNextUnusedLabel(edges, params?.fromNode?.id, nodeFormLabels)
    if (unusedLabel) {
      return <GenericConnectionLine params={params} label={unusedLabel} />
    }
  }
  return null
}

export const edgeTypes: EdgeTypes = {
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionEdge,
  [`${Action.CouponCode}`]: CouponCodeActionEdge,
  [`${Action.SubscribeForMailing}`]: SubscribeForMailingEdge,
  [`${Action.AskAQuestion}`]: AskAQuestionActionEdge
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
    case Action.AskAQuestion:
      return <AskAQuestionActionForm node={node} />
    case Action.CouponCode:
      return <CouponCodeActionForm node={node} />
    case Action.SubscribeForMailing:
      return <SubscribeForMailingForm node={node} />
    case VisitorBotInteractionTrigger.VisitorClicksBotsButton:
      return <VisitorClicksBotsButtonForm node={node} />

    default:
      return null
  }
}



