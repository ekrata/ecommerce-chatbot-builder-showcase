
export const onDragStart = (event, nodeType) => {
  console.log('start here', nodeType)
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};