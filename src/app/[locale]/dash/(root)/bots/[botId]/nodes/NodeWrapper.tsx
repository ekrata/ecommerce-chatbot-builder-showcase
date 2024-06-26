import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { BiSolidError } from 'react-icons/bi';
import { BsRobot } from 'react-icons/bs';
import { Node } from 'reactflow';

import { useNodeContext } from '../BotEditor';

interface Props {
  node?: Node,
  nodeElement: JSX.Element,
  nodeName: string,
  hasErrors?: boolean,
  hasTooManyConnections?: boolean
}

export const NodeWrapper: React.FC<Props> = ({ node, nodeElement, nodeName, hasErrors, hasTooManyConnections }) => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')
  const [_, __, ____, selectedNode] = useNodeContext()
  const [selected, setSelected] = useState<boolean>(node?.selected ?? false);

  useEffect(() => {
    setSelected(false)
  }, [selectedNode])

  return (
    <div className="indicator ">
      {hasErrors &&
        <div className="z-10 text-sm tooltip tooltip-error" data-tip={tBots("This node contains fields with errors, please ensure these errors are fixed or the bot will not run")}>
          <span className="mt-1 shadow-2xl indicator-item indicator-start badge badge-error"><BiSolidError /></span>
        </div>
      }
      {hasTooManyConnections &&
        <div className="z-10 text-sm tooltip tooltip-warning" data-tip={tBots("This node has connections that are cannot be triggered, add more output nodes(such as decisions), to fix this")}>
          <span className="mt-1 shadow-2xl indicator-item indicator-end badge badge-warning"><BiSolidError /></span>
        </div>
      }
      <div className='flex flex-col justify-center w-20 text-center group gap-y-1 place-items-center'>
        <div className={`justify-center mt-2 focus:animate-jump ${selected && 'shadow-blue-500 shadow-2xl'}`}>
          {nodeElement}
        </div>
        <p className="flex p-1 mt-2 text-xs font-light text-center bg-white shadow-md select-none place-items-center gap-x-2 whitespace-nowrap flex-nowrap -z-10 group-hover:animate-duration-500 group-hover:animate-fade-up group-hover:invisible">
          {nodeName?.toLowerCase().includes('agent') &&
            <BsRobot />}
          {nodeName}
        </p>
      </div >
    </div >
  )
}