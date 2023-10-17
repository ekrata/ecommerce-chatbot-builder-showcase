import { Edge, Node } from 'reactflow';

export const getNextUnusedLabel = (
  edges: Edge[],
  nodeId: string,
  nodeFormLabels: string[] = [],
) => {
  const edgeLabels = edges
    .filter((edgeIteration) => edgeIteration?.target === nodeId)
    .map((edge) => edge?.data?.label as string);
  // get form labels that are not an edge
  const unusedLabels = (nodeFormLabels ?? [])?.filter(
    (formLabel) => !edgeLabels.includes(formLabel),
  );
  console.log(unusedLabels);
  if (unusedLabels?.length) {
    return unusedLabels[0];
  }
};
