import 'reactflow/dist/style.css';

import { EntityItem } from 'electrodb';
import { ComponentType, ReactElement } from 'react';
import {
  ConnectionLineComponent, ConnectionLineComponentProps, ConnectionLineType, Edge, EdgeTypes,
  Node, NodeTypes
} from 'reactflow';

import { Actions, Conditions, TriggerValues } from '@/entities/bot';
import { Message } from '@/entities/message';
import {
  Action, Condition, NodeTypeKey, VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

import { nodeSubTypeIcons } from '../nodeSubTypeIcons';
import { OutputFieldKey, OutputFieldsKeys } from '../outputFields';
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
import { ChatStatusConditionEdge } from './nodes/conditions/ChatStatus';
import { GenericConnectionLine } from './nodes/shared/GenericConnectionLine';
import { getNextUnusedLabel } from './nodes/shared/getNextUnusedLabel';
import {
  FirstVisitOnSiteTriggerEdge, FirstVisitOnSiteTriggerForm, FirstVisitOnSiteTriggerNode
} from './nodes/triggers/FirstVisitOnSite';
import {
  VisitorClicksBotsButtonForm, VisitorClicksBotsButtonTriggerNode
} from './nodes/triggers/VisitorClicksBotsButtonTrigger';
import {
  VisitorClicksOnChatIconTriggerEdge, VisitorClicksOnChatIconTriggerForm,
  VisitorClicksOnChatIconTriggerNode
} from './nodes/triggers/VisitorClicksOnChatIcon';
import {
  VisitorSaysTriggerEdge, VisitorSaysTriggerForm, VisitorSaysTriggerNode
} from './nodes/triggers/VisitorSays';
import { onDragStart } from './onDragStart';

export const conditionNode = (value: Conditions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-warning pointer-grab gap-x-2 btn btn-outline mask mask-diamond' onDragStart={(event) => onDragStart(event, value as NodeTypeKey)} draggable>
    {nodeSubTypeIcons[value as Conditions]}
  </a>
)

export const triggerNode = (value: TriggerValues) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-success pointer-grab gap-x-2 btn btn-outline mask mask-circle' onDragStart={(event) => onDragStart(event, value as unknown as NodeTypeKey)} draggable>
    {nodeSubTypeIcons[value as TriggerValues]}
  </a>
)

export const actionNode = (value: Actions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-info pointer-grab gap-x-2 btn btn-outline mask mask-squircle' onDragStart={(event) => onDragStart(event, value as NodeTypeKey)} draggable>
    {nodeSubTypeIcons[value as Actions]}
  </a>
)

export const nodeTypes: NodeTypes = {
  [`${VisitorBotInteractionTrigger.VisitorClicksBotsButton}` as string]: VisitorClicksBotsButtonTriggerNode,
  [`${VisitorBotInteractionTrigger.VisitorClicksChatIcon}` as string]: VisitorClicksOnChatIconTriggerNode,
  [`${VisitorBotInteractionTrigger.VisitorSays}` as string]: VisitorSaysTriggerNode,
  [`${VisitorPageInteractionTrigger.FirstVisitOnSite}` as string]: FirstVisitOnSiteTriggerNode,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  [`${Condition.BasedOnContactProperty}` as string]: BasedOnContactPropertyConditionNode,
  // [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
  [`${Action.DecisionQuickReplies}` as string]: DecisionQuickRepliesActionNode,
  [`${Action.DecisionCardMessages}` as string]: DecisionCardMessagesActionNode,
  [`${Action.DecisionButtons}` as string]: DecisionButtonsActionNode,
  [`${Action.AskAQuestion}` as string]: AskAQuestionActionNode,
  [`${Action.CouponCode}` as string]: CouponCodeActionNode,
  [`${Action.SubscribeForMailing}` as string]: SubscribeForMailingNode,
  [`${Action.SendAChatMessage}` as string]: SendAChatMessageActionNode,
} as const;



export const renderConnectionLine = (params: ConnectionLineComponentProps, edges: Edge[]) => {
  if (params?.fromNode?.id && params?.fromNode?.type) {
    const nodeFormLabels = params?.fromNode?.data?.[OutputFieldsKeys?.[params?.fromNode?.type as OutputFieldKey]]
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
  [`${Condition.ChatStatus}`]: ChatStatusConditionEdge,
  [`${VisitorBotInteractionTrigger.VisitorClicksChatIcon}`]: VisitorClicksOnChatIconTriggerEdge,
  [`${VisitorBotInteractionTrigger.VisitorSays}`]: VisitorSaysTriggerEdge,
  [`${VisitorPageInteractionTrigger.FirstVisitOnSite}`]: FirstVisitOnSiteTriggerEdge,
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
    case VisitorBotInteractionTrigger.VisitorClicksChatIcon:
      return <VisitorClicksOnChatIconTriggerForm node={node} />
    case VisitorBotInteractionTrigger.VisitorSays:
      return <VisitorSaysTriggerForm node={node} />
    case VisitorPageInteractionTrigger.FirstVisitOnSite:
      return <FirstVisitOnSiteTriggerForm node={node} />

    default:
      return null
  }
}

export const defaultOutputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const successFailureOutput = ['✓ Success', '⤫ Failure']
export const yesNoOutput = ['✓ Yes', '⤫ No']
export const onlineOfflineOutput = ['✓ Online', '⤫ Offline']



