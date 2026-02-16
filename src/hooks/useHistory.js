import { useState, useEffect, useCallback, useRef } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';

const MAX_HISTORY = 60;

// Strip fields that shouldn't trigger a snapshot
const snapshot = (nodes, edges) => ({
  nodes: nodes.map(({ selected, ...n }) => n), // drop selected
  edges,
});

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useHistory = (initialNodes, initialEdges) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Use refs so callbacks are never stale
  const historyRef    = useRef([snapshot(initialNodes, initialEdges)]);
  const cursorRef     = useRef(0);
  const isApplyingRef = useRef(false);  // true while undo/redo is being applied
  const debounceRef   = useRef(null);
  const [, forceRender] = useState(0);

  // Watch nodes+edges; push to history after they settle
  useEffect(() => {
    if (isApplyingRef.current) return;

    const snap = snapshot(nodes, edges);

    // Don't push if nothing actually changed from current cursor position
    if (equal(snap, historyRef.current[cursorRef.current])) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isApplyingRef.current) return;

      // Truncate future if we branched
      const newHistory = [
        ...historyRef.current.slice(0, cursorRef.current + 1),
        snap,
      ].slice(-MAX_HISTORY);

      historyRef.current = newHistory;
      cursorRef.current  = newHistory.length - 1;
      forceRender(n => n + 1);
    }, 350); // 350ms settle time — short enough to feel responsive
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (cursorRef.current <= 0) return;
    isApplyingRef.current = true;
    cursorRef.current -= 1;
    const { nodes: n, edges: e } = historyRef.current[cursorRef.current];
    setNodes(n);
    setEdges(e);
    forceRender(x => x + 1);
    // Release lock after ReactFlow has processed the update
    requestAnimationFrame(() => requestAnimationFrame(() => {
      isApplyingRef.current = false;
    }));
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (cursorRef.current >= historyRef.current.length - 1) return;
    isApplyingRef.current = true;
    cursorRef.current += 1;
    const { nodes: n, edges: e } = historyRef.current[cursorRef.current];
    setNodes(n);
    setEdges(e);
    forceRender(x => x + 1);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      isApplyingRef.current = false;
    }));
  }, [setNodes, setEdges]);

  return {
    nodes, edges,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    undo,
    redo,
    canUndo: cursorRef.current > 0,
    canRedo: cursorRef.current < historyRef.current.length - 1,
    historySize: historyRef.current.length,
  };
};