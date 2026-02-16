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
      // measured is populated after first render — fall back to style, then generous defaults
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

  return { tidyLayout };
};