import { useTranslations } from 'next-intl';
import {
  Condition, OperatorInteractionTrigger, ShopifyCondition, VisitorBotInteractionTrigger,
  VisitorPageInteractionTrigger
} from 'packages/functions/app/api/src/bots/triggers/definitions.type';

import { nodeSubTypeIcons } from '../nodeSubTypeIcons';
import { onDragStart } from './onDragStart';

export interface Props {
  key: string,
  value: VisitorBotInteractionTrigger | VisitorPageInteractionTrigger | OperatorInteractionTrigger
}

export const ConditionNode: React.FC<Props> = ({ key, value }) => {
  const tNodes = useTranslations('dash.bots.nodes')

  return (
    <li className='flex flex-col flex-wrap justify-center gap-y-2 place-items-center'>
      <a className='flex flex-row w-16 h-16 p-2 text-3xl normal-case pointer-grab bg-success gap-x-2 btn btn-outline mask mask-circle' onDragStart={(event) => onDragStart(event, 'input')} draggable>
        {nodeSubTypeIcons[value as VisitorBotInteractionTrigger | VisitorPageInteractionTrigger | OperatorInteractionTrigger]}
      </a>
      <p className="text-xs font-light">
        {tNodes(`Condition.${key}`)}
      </p>
    </li>

  )
}