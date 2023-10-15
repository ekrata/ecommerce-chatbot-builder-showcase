import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Node, NodeTypes } from 'reactflow';

import { DecisionQuickRepliesActionForm } from './actions/DecisionQuickRepliesAction';

interface Props {
  node: Node
}

export const NodeForm: React.FC<Props> = ({ node }) => {
  switch (node.type) {
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesActionForm node={node} />
    default:
      return null
  }
}



