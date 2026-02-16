import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { useMemo } from 'react';
import { EDGE_CONFIGS } from '../../utils/constants';

// How far the bezier handles push out — higher = more arc
const CURVATURE = 0.35;

export const SmartEdge = ({
  id,
  source, target,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data = {},
  selected,
  markerEnd,
  style = {},
}) => {
  const { getNodes, getEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature: CURVATURE,
  });

  // ── Dimming logic ─────────────────────────────────────────────────────────
  // If any node is selected, dim edges not connected to it
  const opacity = useMemo(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const anySelected = nodes.some(n => n.selected);

    if (!anySelected) return 0.55; // resting — slightly faded, less visual noise

    // Is this edge connected to a selected node?
    const connectedToSelected = nodes
      .filter(n => n.selected)
      .some(n => n.id === source || n.id === target);

    return connectedToSelected ? 1 : 0.06;
  }, [getNodes, getEdges, source, target]);

  // ── Color from edge data or config ───────────────────────────────────────
  const color = style?.stroke ?? data?.color ?? EDGE_CONFIGS.default?.color ?? '#6366f1';

  const strokeWidth = selected ? 3 : 1.5;

  return (
    <>
      {/* Invisible wide hit area so edge is easy to click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'pointer' }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth,
          opacity,
          transition: 'opacity 0.15s ease, stroke-width 0.1s ease',
        }}
      />

      {/* Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position:   'absolute',
              transform:  `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              opacity,
              transition: 'opacity 0.15s ease',
              pointerEvents: 'none',
              color,
            }}
            className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold
                       bg-neutral-950/90 border border-neutral-800/60"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};