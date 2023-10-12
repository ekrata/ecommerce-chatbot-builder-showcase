import { useTranslations } from 'next-intl';
import {
  VisitorBotInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { Handle, Position } from 'reactflow';

import { triggerNode } from '../../nodes';

// const handleStyle = { left: 10 };

export const VisitorClicksBotsButtonTriggerNode = () => {
  const tNodes = useTranslations('dash.bots.nodes')
  return (
    <div className='w-16'>
      <Handle type="source" id={'source'} position={Position.Top} className='' />
      <div className='flex flex-col justify-center w-20 text-center gap-y-1 place-items-center'>
        <div className='justify-center mt-2 '>
          {triggerNode(VisitorBotInteractionTrigger.VisitorClicksBotsButton)}
        </div>
        <p className="text-xs font-light text-center bg-white shadow-2xl select-none">
          {tNodes(`VisitorBotInteractionTrigger.VisitorClicksBotsButton`)}
        </p>
      </div >
      <Handle type="target" position={Position.Left} id="a" />
      <Handle type="target" position={Position.Right} id="b" />
    </div>
  );
}
