import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Handle, Position } from 'reactflow';

import { actionNode } from '../../nodes';

const handleStyle = { left: 10 };

export const SendAChatMessageActionNode = () => {
  const subNodeType = Action.SendAChatMessage

  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div>
        <label htmlFor="text"></label>
        {actionNode(subNodeType)}
      </div>
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="target" position={Position.Right} id="b" style={handleStyle} />
    </>
  );
}
