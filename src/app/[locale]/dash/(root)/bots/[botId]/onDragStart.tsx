import { NodeTypeKey } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

export const onDragStart = (event: any, nodeTypeKey: NodeTypeKey) => {
  console.log('start here', nodeTypeKey)
  event.dataTransfer.setData('application/reactflow', nodeTypeKey);
  event.dataTransfer.effectAllowed = 'move';
};