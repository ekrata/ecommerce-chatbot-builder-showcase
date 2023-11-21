import { Node } from 'reactflow';

import { actions, agents, BotNodeType, conditions, triggers } from '@/entities/bot';

import { nodeSubTypeIcons, SubNodeType } from '../nodeSubTypeIcons';
import { NodeForm } from './collections';

// render the data form of a node
export const getNodeForm = (selectedNode: Node, renderForm: boolean = true) => {

  return (
    <>
      <h5 className='flex flex-row justify-center flex-between place-items-center gap-x-2'>
        {triggers.includes(selectedNode.type as any) && <div className="flex flex-row w-4 h-4 text-xl normal-case border-0 place-items-center bg-success gap-x-2 btn btn-outline mask mask-circle">
          <div className='text-xl'>
            {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
          </div>
        </div>}
        {conditions.includes(selectedNode.type as any) && <div className="flex flex-row w-1 h-1 text-xl normal-case border-0 bg-warning gap-x-2 btn btn-outline mask mask-diamond">
          <div className='text-xl'>
            {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
          </div>
        </div>}
        {actions.includes(selectedNode.type as any) && <div className="flex flex-row w-1 h-1 text-xl normal-case border-0 bg-info gap-x-2 btn btn-outline mask mask-squircle">

          <div className='text-xl'>
            {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
          </div>
        </div>}
        {selectedNode?.type}
        {agents.includes(selectedNode.type as any) && <div className="flex flex-row w-1 h-1 text-xl normal-case border-0 bg-info gap-x-2 btn btn-outline mask-hexagon">
          <div className='text-xl'>
            {nodeSubTypeIcons[selectedNode.type as SubNodeType]}
          </div>
        </div>}
        {selectedNode?.type}
      </h5>
      {renderForm && <NodeForm node={selectedNode} />}
    </>
  )
}