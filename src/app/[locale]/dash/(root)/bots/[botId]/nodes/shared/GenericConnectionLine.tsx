import { FC } from 'react';
import {
  BaseEdge, ConnectionLineComponentProps, EdgeLabelRenderer, getBezierPath
} from 'reactflow';

interface ConnectionProps {
  params: ConnectionLineComponentProps,
  label: string
}

export const GenericConnectionLine: FC<ConnectionProps> = (props) => {
  if (props?.params) {
    const { params } = props
    if (params?.fromX && params?.fromY && params?.fromPosition && params?.toX && params?.toY && params?.toPosition) {
      const {
        fromX,
        fromY,
        fromPosition,
        toX,
        toY,
        toPosition,
        connectionLineStyle
      } = params
      const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: fromX ?? 0,
        sourceY: fromY ?? 0,
        sourcePosition: fromPosition ?? 0,
        targetX: toX ?? 0,
        targetY: toY ?? 0,
        targetPosition: toPosition ?? 0,
      });

      return (
        <>
          {edgePath && <BaseEdge path={edgePath} style={connectionLineStyle} />}
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                fontSize: 12,
                padding: 10,
                borderRadius: 5,
                pointerEvents: 'all',
                fontWeight: 700,
                // everything inside EdgeLabelRenderer has no pointer events by default
                // if you have an interactive element, set pointer-events: all
              }}
              className=" nodrag nopan"
            >
              {props?.label}
            </div>
          </EdgeLabelRenderer>
          {/* <circle cx={toX} cy={toY} fill="#222" r={3} stroke="#222" strokeWidth={1.5} /> */}
        </>
      );
    }
  }
  return null
};