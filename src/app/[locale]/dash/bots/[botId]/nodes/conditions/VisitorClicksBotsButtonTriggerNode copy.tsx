import {
  Condition, VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Handle, Position } from 'reactflow';

import { triggerNode } from '../../nodes';

const handleStyle = { left: 10 };

export const VisitorClicksBotsButtonTriggerNode: React.FC = () => {

  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div>
        {triggerNode(VisitorBotInteractionTrigger.VisitorClicksBotsButton)}

      </div>
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="target" position={Position.Right} id="b" style={handleStyle} />
    </>
  );
}
