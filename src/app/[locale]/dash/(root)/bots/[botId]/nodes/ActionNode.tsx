

import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

import { Conditions } from '@/entities/bot';

import { conditionNode } from '../collections';

const handleStyle = { left: 10 };

interface Props {
  value: Conditions
}

export const  : React.FC<Props> = ({value}) => {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
  <>
    <Handle type="source" position={Position.Top} />
    <div>
      <label htmlFor="text">Text:</label>
      {conditionNode(value)}
    </div>
    <Handle type="target" position={Position.Left} id="a" />
    <Handle type="target" position={Position.Right} id="b" style={handleStyle} />
  </>
  );
}
