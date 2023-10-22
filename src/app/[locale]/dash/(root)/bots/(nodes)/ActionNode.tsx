import { Condition } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const ConditionNode: React.FC<NodeProps> = ({ type }) => {
  return (
    <div className="p-2 bg-white border-2 rounded-md shadow-md mask mask-diamond border-stone-400">
      <div className="flex">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
          {/* {data.emoji} */}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{type}</div>
          {/* <div className="text-gray-500">{data.job}</div> */}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="target" position={Position.Bottom} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      <Handle type="target" position={Position.Left} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Left} className="w-16 !bg-teal-500" />
      <Handle type="target" position={Position.Right} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Right} className="w-16 !bg-teal-500" />
    </div>
  );
}

export default memo(ConditionNode);
