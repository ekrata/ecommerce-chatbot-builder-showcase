import 'reactflow/dist/style.css';

import {
  Action, Condition, VisitorBotInteractionTrigger
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
  DecisionButtonsActionEdge, DecisionButtonsActionForm, DecisionButtonsActionNode
} from './nodes/actions/DecisionButtons';
import {
  DecisionCardMessagesActionEdge, DecisionCardMessagesActionForm, DecisionCardMessagesActionNode
} from './nodes/actions/DecisionCardMessages';
import {
  DecisionQuickRepliesActionEdge, DecisionQuickRepliesActionForm, DecisionQuickRepliesActionNode
} from './nodes/actions/DecisionQuickReplies';
import {
  SendAChatMessageActionEdge, SendAChatMessageActionForm, SendAChatMessageActionNode
} from './nodes/actions/SendAChatMessage';
import {
  SubscribeForMailingEdge, SubscribeForMailingForm, SubscribeForMailingNode
} from './nodes/actions/SubscribeForMailing';
import {
  BasedOnContactPropertyConditionEdge, BasedOnContactPropertyConditionForm,
  BasedOnContactPropertyConditionNode
} from './nodes/conditions/BasedOnContactProperty';
import { GenericConnectionLine } from './nodes/shared/GenericConnectionLine';
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
  [`${Condition.BasedOnContactProperty}`]: BasedOnContactPropertyConditionNode,
  // [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionNode,
  [`${Action.DecisionCardMessages}`]: DecisionCardMessagesActionNode,
  [`${Action.DecisionButtons}`]: DecisionButtonsActionNode,
  [`${Action.AskAQuestion}`]: AskAQuestionActionNode,
  [`${Action.CouponCode}`]: CouponCodeActionNode,
  [`${Action.SubscribeForMailing}`]: SubscribeForMailingNode,
  [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
};




export const OutputFieldsKeys = {
  [`${Action.AskAQuestion}`]: 'outputs',
  [`${Action.CouponCode}`]: 'outputs',
  [`${Action.SendAChatMessage}`]: 'outputs',
  [`${Action.DecisionQuickReplies}`]: 'quickReplies',
  [`${Action.DecisionCardMessages}`]: 'choices',
  [`${Action.DecisionButtons}`]: 'choices',
  [`${Condition.BasedOnContactProperty}`]: 'outputs',
} as const

export type OutputFieldKey = typeof OutputFieldsKeys[keyof typeof OutputFieldsKeys]

export const renderConnectionLine = (params: ConnectionLineComponentProps, edges: Edge[]) => {
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
  [`${Action.DecisionButtons}`]: DecisionButtonsActionEdge,
  [`${Action.DecisionCardMessages}`]: DecisionCardMessagesActionEdge,
  [`${Action.CouponCode}`]: CouponCodeActionEdge,
  [`${Action.SendAChatMessage}`]: SendAChatMessageActionEdge,
  [`${Action.SubscribeForMailing}`]: SubscribeForMailingEdge,
  [`${Action.AskAQuestion}`]: AskAQuestionActionEdge,
  [`${Condition.BasedOnContactProperty}`]: BasedOnContactPropertyConditionEdge,
}

interface Props {
  node: Node
}

export const NodeForm: React.FC<Props> = ({ node }) => {
  switch (node.type) {
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesActionForm node={node} />
    case Action.DecisionCardMessages:
      return <DecisionCardMessagesActionForm node={node} />
    case Action.DecisionButtons:
      return <DecisionButtonsActionForm node={node} />
    case Action.SendAChatMessage:
      return <SendAChatMessageActionForm node={node} />
    case Action.AskAQuestion:
      return <AskAQuestionActionForm node={node} />
    case Action.CouponCode:
      return <CouponCodeActionForm node={node} />
    case Action.SubscribeForMailing:
      return <SubscribeForMailingForm node={node} />
    case Condition.BasedOnContactProperty:
      return <BasedOnContactPropertyConditionForm node={node} />
    case VisitorBotInteractionTrigger.VisitorClicksBotsButton:
      return <VisitorClicksBotsButtonForm node={node} />

    default:
      return null
  }
}

export const defaultOutputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const successFailure = ['✓ Success', '⤫ Failure']
export const yesNo = ['✓ Yes', '⤫ No']



