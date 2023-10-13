import {
  Action, Condition, VisitorBotInteractionTrigger, VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Node, NodeTypes } from 'reactflow';

import {
  DecisionQuickRepliesActionForm, DecisionQuickRepliesActionNode
} from './actions/DecisionQuickRepliesAction';
import { SendAChatMessageActionNode } from './actions/SendAChatMessageAction';
import { BasedOnContactPropertyConditionNode } from './conditions/BasedOnContactProperty';
import { VisitorClicksBotsButtonTriggerNode } from './triggers/VisitorClicksBotsButtonTriggerNode';

export const nodeTypes: NodeTypes = {
  [`${VisitorBotInteractionTrigger.VisitorClicksBotsButton}`]: VisitorClicksBotsButtonTriggerNode,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
  [`${Condition.BasedOnContactProperty}`]: BasedOnContactPropertyConditionNode,
  [`${Action.SendAChatMessage}`]: SendAChatMessageActionNode,
  [`${Action.DecisionQuickReplies}`]: DecisionQuickRepliesActionNode,
};

// export const formTypes = {
//   // [`${VisitorBotInteractionTrigger.VisitorClicksBotsButton}`]: VisitorClicksBotsButtonTriggerForm,
//   // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
//   // [VisitorBotInteractionTrigger.InstagramStoryReply]: <VisitorClicksBotsButtonTriggerNode />,
//   // [`${Condition.BasedOnContactProperty}`]: BasedOnContactPropertyConditionNode,
//   [`${Action.DecisionQuickReplies}`]: <DecisionQuickRepliesActionForm />
// };



export const renderNodeForm = (node: Node) => {
  switch (node.type) {
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesActionForm node={node} />
  }



}