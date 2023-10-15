import { useEffect, useState } from 'react';

import { useNodeContext } from '../BotEditor';
import { actionNode } from '../nodes';

interface Props {
  nodeElement: JSX.Element,
  nodeName: string
}

export const NodeWrapper: React.FC<Props> = ({ nodeElement, nodeName }) => {
  const [_, __, ____, selectedNode] = useNodeContext()
  const [selected, setSelected] = useState<boolean>();

  useEffect(() => {
    setSelected(false)
  }, [selectedNode])
  // ${selected ? 'ring-2   ring-offset-2  ring-blue-500  rounded-2xl animate-jump  ' : 'ring-4   ring-offset-2  ring-transparent  rounded-2xl   '}
  return (
    < div className='flex flex-col justify-center w-20 text-center gap-y-1 place-items-center' onClick={() => setSelected(!selected)}>
      <div className={`justify-center mt-2 focus:animate-jump`}>
        {nodeElement}
      </div>
      <p className="text-xs font-light text-center bg-white shadow-2xl select-none">
        {nodeName}
      </p>
    </div >
  )
}