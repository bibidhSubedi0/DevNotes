import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

const NODE_SEP  = 100;
const RANK_SEP  = 160;

export const useDagreLayout = () => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  const tidyLayout = useCallback(async () => {
    const dagre = await import('dagre');
    const g     = new dagre.default.graphlib.Graph();

    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: NODE_SEP, ranksep: RANK_SEP, marginx: 60, marginy: 60 });

    const nodes    = getNodes();
    const edges    = getEdges();
    const topLevel = nodes.filter(n => !n.parentId);
    const children = nodes.filter(n =>  n.parentId);

    topLevel.forEach(n => {
      const w = n.measured?.width  ?? n.style?.width  ?? 400;
      const h = n.measured?.height ?? n.style?.height ?? 300;
      g.setNode(n.id, { width: w, height: h });
    });

    const topIds = new Set(topLevel.map(n => n.id));
    edges.forEach(e => {
      if (topIds.has(e.source) && topIds.has(e.target))
        g.setEdge(e.source, e.target);
    });

    dagre.default.layout(g);

    const laid = topLevel.map(n => {
      const { x, y, width, height } = g.node(n.id);
      return { ...n, position: { x: x - width / 2, y: y - height / 2 } };
    });

    setNodes([...laid, ...children]);
    setTimeout(() => fitView({ duration: 600, padding: 0.12 }), 80);
  }, [getNodes, getEdges, setNodes, fitView]);

  /** Snap all top-level nodes into a horizontal row, evenly spaced */
  const alignRow = useCallback(() => {
    const nodes    = getNodes();
    const children = nodes.filter(n => n.parentId);
    const topLevel = nodes.filter(n => !n.parentId);

    // Sort by current x so order is preserved
    const sorted  = [...topLevel].sort((a, b) => a.position.x - b.position.x);
    const GAP     = 80;
    const baseY   = sorted.reduce((sum, n) => sum + n.position.y, 0) / sorted.length; // avg y

    let cursor = sorted[0]?.position.x ?? 0;
    const laid = sorted.map(n => {
      const w   = n.measured?.width ?? n.style?.width ?? 400;
      const pos = { x: cursor, y: baseY };
      cursor   += w + GAP;
      return { ...n, position: pos };
    });

    setNodes([...laid, ...children]);
    setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 60);
  }, [getNodes, setNodes, fitView]);

  /** Snap all top-level nodes into a vertical column, evenly spaced */
  const alignColumn = useCallback(() => {
    const nodes    = getNodes();
    const children = nodes.filter(n => n.parentId);
    const topLevel = nodes.filter(n => !n.parentId);

    // Sort by current y so order is preserved
    const sorted  = [...topLevel].sort((a, b) => a.position.y - b.position.y);
    const GAP     = 60;
    const baseX   = sorted.reduce((sum, n) => sum + n.position.x, 0) / sorted.length;

    let cursor = sorted[0]?.position.y ?? 0;
    const laid = sorted.map(n => {
      const h   = n.measured?.height ?? n.style?.height ?? 300;
      const pos = { x: baseX, y: cursor };
      cursor   += h + GAP;
      return { ...n, position: pos };
    });

    setNodes([...laid, ...children]);
    setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 60);
  }, [getNodes, setNodes, fitView]);

  return { tidyLayout, alignRow, alignColumn };
};