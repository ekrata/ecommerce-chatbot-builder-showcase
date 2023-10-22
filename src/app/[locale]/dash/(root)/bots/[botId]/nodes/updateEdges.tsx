import { Dispatch, SetStateAction } from 'react';
import { Edge } from 'reactflow';

export const updateEdges = (values: object, edge: Edge, edges: Edge[], setEdges: Dispatch<SetStateAction<Edge[]>>) => {
  if (edge?.id) {
    // const { id, position } = edge?.data
    const newEdges = [...edges.filter((oldEdge) => oldEdge?.id !== edge.id), {
      ...edge, data: { ...edge.data, ...values }
    }]
    console.log(edges, newEdges)
    setEdges(newEdges)
  }
}