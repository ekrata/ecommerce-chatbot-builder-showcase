import { FC, useEffect, useMemo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useNodes } from 'reactflow';

import { useEdgeContext } from '../../BotEditor';
import { getNextUnusedLabel } from './getNextUnusedLabel';

export type GenericEdgeProps = EdgeProps & { outputKey: string }


export const GenericEdge: FC<GenericEdgeProps> = (
  {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    outputKey,
    style = {},
    markerEnd,
  }) => {
  const nodes = useNodes()
  const [edges, setEdges] = useEdgeContext()


  const edge = useMemo(() => edges?.find((edge) => edge?.id === id), [edges, id])
  const node = useMemo(() => nodes.find((node) => node.id === edge?.target), [nodes])

  // do not render if 
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    // increase curvurture to differentiate duplicated edges
    curvature: 0.04 * parseInt(edge?.targetHandle?.replace(/\D/g, '') ?? '1', 10) + 1,
  });


  // set a node 
  useEffect(() => {
    const edge = edges?.find((edge) => edge?.id === id)
    const node = nodes?.find((node) => node.id === edge?.target)
    if (node?.data?.[outputKey] && edge?.target) {
      const unusedLabel = getNextUnusedLabel(edges, edge?.target, node?.data?.[outputKey])
      if (unusedLabel) {
        setEdges([...edges.filter((edge) => edge?.id !== id), { ...edge, data: { label: unusedLabel } }])
      }
    }
  }, [id])


  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 0.2 * parseInt(edge?.targetHandle?.replace(/\D/g, '') ?? '1', 10) + 1}px)`,
            fontSize: 12,
            padding: 10,
            borderRadius: 5,
            pointerEvents: 'all',
            fontWeight: 700,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            // change curv
          }}
          className=" nodrag nopan"
        >
          {/* {label} */}
          {edge?.data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}