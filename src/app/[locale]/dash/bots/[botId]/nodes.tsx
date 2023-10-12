import { Actions, Conditions, Triggers } from '@/entities/bot';

import { nodeSubTypeIcons, SubNodeType } from '../nodeSubTypeIcons';
import { onDragStart } from './onDragStart';

export const conditionNode = (value: Conditions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-warning pointer-grab gap-x-2 btn btn-outline mask mask-diamond' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Conditions]}
  </a>
)

export const triggerNode = (value: Triggers) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-success pointer-grab gap-x-2 btn btn-outline mask mask-circle' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Triggers]}
  </a>
)

export const actionNode = (value: Actions) => (
  <a className='flex flex-row w-16 h-16 text-3xl normal-case border-0 bg-info pointer-grab gap-x-2 btn btn-outline mask mask-squircle' onDragStart={(event) => onDragStart(event, value)} draggable>
    {nodeSubTypeIcons[value as Actions]}
  </a>
)