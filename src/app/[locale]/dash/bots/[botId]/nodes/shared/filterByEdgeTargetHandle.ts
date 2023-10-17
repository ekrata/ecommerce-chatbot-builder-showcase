import { Edge } from 'reactflow';

export const filterByEdgeTargetHandle = (
  edges: Edge[],
  targetHandleId: string,
) => edges.filter((edge) => edge.targetHandle === targetHandleId);
