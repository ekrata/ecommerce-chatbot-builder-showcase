import {
  Condition, VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Handle, Position } from 'reactflow';

import { Conditions, triggers } from '@/entities/bot';

import { triggerNode } from '../../nodes';

const handleStyle = { left: 10 };

export const BasedOnContactPropertyConditionNode = () => {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        {triggerNode(VisitorBotInteractionTrigger.VisitorClicksBotsButton)}
      </div>
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="target" position={Position.Right} id="b" style={handleStyle} />
    </>
  );
}


export const BasedOnContactPropertyConditionForm: React.FC = () => {
}

