import { Edge, Node } from 'reactflow';

export const getNextUnusedLabel = (
  edges: Edge[],
  nodes: Node[],
  arrayName: string,
  edge?: Edge,
  targetNodeId?: string,
) => {
  if (!edge && !targetNodeId) {
    throw new Error('Please supply an edge or targetNodeId');
  }
  // get all edges of target node
  const nodeEdges = edges.filter(
    (edgeIteration) =>
      edgeIteration.targetNode?.id === edge?.targetNode?.id ||
      edgeIteration.targetNode?.id === targetNodeId,
  );
  const nodeData = nodes.find(
    (node) => node.id === edge?.target || node.id === targetNodeId,
  );
  if (nodeData?.data?.[arrayName]) {
    // get index of current node
    const position =
      nodeEdges?.findIndex((nodeEdge) => nodeEdge.id === edge?.id) ?? 0;
    if (position < nodeData?.data?.[arrayName].length) {
      // get unused labels by comparing edges state and allLabels
      const allLabels = nodeData.data?.[arrayName].map(
        (reply, i) => `${i + 1}: ${reply}`,
      );
      const existingLabels = nodeEdges.map(({ data }) => data?.label);
      const unusedLabels = allLabels.filter(
        (label) => !existingLabels.includes(label),
      );

      // if there are still unassigned labels, assign the firstmost label
      if (unusedLabels.length) {
        return unusedLabels?.[0];
      }
      // updateEdge(edgeData, `${position + 1}: ${nodeData?.data?.quickReplies[position]}`, + 1}: ${ nodeData?.data?.quickReplies[position] } `
    }
  }
};
