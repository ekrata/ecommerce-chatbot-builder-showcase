import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { BiSolidError } from 'react-icons/bi';

import { useNodeContext } from '../BotEditor';

interface Props {
  nodeElement: JSX.Element,
  nodeName: string,
  hasErrors?: boolean
}

export const NodeWrapper: React.FC<Props> = ({ nodeElement, nodeName, hasErrors }) => {
  const tDash = useTranslations('dash')
  const [_, __, ____, selectedNode] = useNodeContext()
  const [selected, setSelected] = useState<boolean>();

  useEffect(() => {
    setSelected(false)
  }, [selectedNode])

  return (
    <div className="indicator">
      {hasErrors &&
        <div className="z-10 text-sm tooltip tooltip-error" data-tip={tDash("This node contains fields with errors, please ensure these errors are fixed or the bot will not run")}>
          <span className="mt-1 shadow-2xl indicator-item indicator-start badge badge-error"><BiSolidError /></span>
        </div>
      }
      <div className='flex flex-col justify-center w-20 text-center gap-y-1 place-items-center' onClick={() => setSelected(!selected)}>
        <div className={`justify-center mt-2 focus:animate-jump`}>
          {nodeElement}
        </div>
        <p className="text-xs font-light text-center bg-white shadow-2xl select-none">
          {nodeName}
        </p>
      </div >
    </div >
  )
}