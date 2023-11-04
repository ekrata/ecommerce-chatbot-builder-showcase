import { compact } from 'lodash';
import { useMemo } from 'react';
import { Edge, Handle, Node, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import { OutputFieldValue } from '../../../outputFields';

/**
 * Create a handler for every handler used by nodeEdges, then add n handlers the difference between
 * nodeEdges  
 * @date 17/10/2023 - 21:50:35
 *
**/
export const createTargetHandles = (node: NodeProps, nodeEdges: Edge[], arrayKey: OutputFieldValue) => {

  const updateNodeInternals = useUpdateNodeInternals()
  // get edges of node
  const ids = compact((nodeEdges.map((nodeEdge) => {
    if (nodeEdge?.targetHandle) {
      return parseInt(nodeEdge?.targetHandle, 10)
    }
  }) ?? []))

  const handles = [...new Set(ids)]?.map((id, i) => {
    return (
      <Handle key={id.toString()} type="target" data-handleid={id?.toString()} position={i % 2 == 0 ? Position.Left : Position.Right} isConnectable={false} id={id?.toString() ?? ''} className={`w-2 h-2 invisible'}`} />
    )
  })
  const unconnectedHandleCount = node?.data?.[arrayKey]?.length - length

  let unconnectedIds = []
  const maxHandleId = ids?.length ? Math.max(...ids) : 0
  for (let i = maxHandleId + 1; i < maxHandleId + 1 + unconnectedHandleCount; i++) {
    unconnectedIds.push(i)
  }

  // console.log(unconnectedIds)

  const unconnectedHandles = unconnectedIds.map((id, i) => {
    return (
      <Handle key={id.toString()} type="target" position={id % 2 == 0 ? Position.Left : Position.Right} isConnectable={true} id={id.toString() ?? ''} className={`w-2 h-2 '}`} />
    )
  })
  updateNodeInternals(node?.id)
  return [...handles, ...unconnectedHandles]
}