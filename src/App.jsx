import React, { useState, useCallback, useEffect } from 'react';
import { MarkerType } from '@xyflow/react';

import { Canvas }           from './components/canvas/Canvas';
import { StatsPanel }       from './components/Panels/StatsPanel';
import { EdgeTypeSelector } from './components/Panels/EdgeTypeSelector';
import { ToolbarPanel }     from './components/Panels/ToolbarPanel';
import { DetailPanel }      from './components/Panels/DetailPanel';
import { BulkActionsBar }     from './components/Panels/BulkActionsBar';
import { ExportImportPanel }  from './components/Panels/ExportImportPanel';

import FunctionNode  from './nodes/FunctionNode';
import FileNode      from './nodes/FileNode';
import ComponentNode from './nodes/ComponentNode';
import ProjectNode   from './nodes/ProjectNode';

import { useHistory }     from './hooks/useHistory';
import { useNodeManager } from './hooks/useNodeManager';
import { useEdgeManager } from './hooks/useEdgeManager';
import { EDGE_TYPES }     from './utils/constants';
import {
  COMP_PAD_H, COMP_HEADER_H, FILE_GAP_V,
  FILE_W, fnY, calcFileH,
} from './utils/layoutConstants';

const nodeTypes = {
  file:      FileNode,
  function:  FunctionNode,
  component: ComponentNode,
  project:   ProjectNode,
};

const INIT_COMP_W = 360;

// ── Initial nodes — intentionally scattered so Tidy Layout is demonstrable ──
const COMP2_W = INIT_COMP_W;
const COMP3_W = INIT_COMP_W;

const initialNodes = [
  // ── Project ──────────────────────────────────────────────────────────────
  {
    id: 'project1',
    type: 'project',
    position: { x: 900, y: 600 }, // buried bottom-right
    data: {
      label: 'My App',
      description: 'Full-stack web application for user authentication.',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      stage: 'development',
    },
  },

  // ── Component 1 — Auth (overlapping comp3) ─────────────────────────────
  {
    id: 'comp1',
    type: 'component',
    position: { x: 320, y: 260 },
    data: {
      width: INIT_COMP_W,
      label: 'Auth Component',
      description: 'Handles all authentication flows.',
      techStack: ['JWT', 'Axios'],
      status: 'stable',
    },
    style: {
      width: INIT_COMP_W,
      height: COMP_HEADER_H + FILE_GAP_V + calcFileH(2, false) + FILE_GAP_V,
    },
  },
  {
    id: 'f1',
    type: 'file',
    parentId: 'comp1',
    extent: 'parent',
    position: { x: COMP_PAD_H, y: COMP_HEADER_H + FILE_GAP_V },
    data: { label: 'AuthService.ts', fileType: 'typescript' },
    style: { width: FILE_W, height: calcFileH(2, false) },
  },
  {
    id: 'fn1',
    type: 'function',
    parentId: 'f1',
    extent: 'parent',
    position: { x: 16, y: fnY(0) },
    data: { label: 'login()', complexity: 'medium', tags: ['auth'] },
  },
  {
    id: 'fn2',
    type: 'function',
    parentId: 'f1',
    extent: 'parent',
    position: { x: 16, y: fnY(1) },
    data: { label: 'logout()', complexity: 'low', tags: ['auth'] },
  },

  // ── Component 2 — API (far top-right, disconnected-looking) ────────────
  {
    id: 'comp2',
    type: 'component',
    position: { x: 800, y: 20 },
    data: {
      width: COMP2_W,
      label: 'API Component',
      description: 'REST API client — wraps all backend calls.',
      techStack: ['Axios', 'React Query'],
      status: 'in-progress',
    },
    style: {
      width: COMP2_W,
      height: COMP_HEADER_H + FILE_GAP_V + calcFileH(2, false) + FILE_GAP_V,
    },
  },
  {
    id: 'f2',
    type: 'file',
    parentId: 'comp2',
    extent: 'parent',
    position: { x: COMP_PAD_H, y: COMP_HEADER_H + FILE_GAP_V },
    data: { label: 'apiClient.ts', fileType: 'typescript' },
    style: { width: FILE_W, height: calcFileH(2, false) },
  },
  {
    id: 'fn3',
    type: 'function',
    parentId: 'f2',
    extent: 'parent',
    position: { x: 16, y: fnY(0) },
    data: { label: 'get()', complexity: 'low', tags: ['api'] },
  },
  {
    id: 'fn4',
    type: 'function',
    parentId: 'f2',
    extent: 'parent',
    position: { x: 16, y: fnY(1) },
    data: { label: 'post()', complexity: 'medium', tags: ['api'] },
  },

  // ── Component 3 — UI (top-left, opposite corner from project) ──────────
  {
    id: 'comp3',
    type: 'component',
    position: { x: 40, y: 500 },
    data: {
      width: COMP3_W,
      label: 'UI Component',
      description: 'Shared UI primitives — buttons, modals, forms.',
      techStack: ['React', 'Tailwind'],
      status: 'stable',
    },
    style: {
      width: COMP3_W,
      height: COMP_HEADER_H + FILE_GAP_V + calcFileH(1, false) + FILE_GAP_V,
    },
  },
  {
    id: 'f3',
    type: 'file',
    parentId: 'comp3',
    extent: 'parent',
    position: { x: COMP_PAD_H, y: COMP_HEADER_H + FILE_GAP_V },
    data: { label: 'Button.tsx', fileType: 'react' },
    style: { width: FILE_W, height: calcFileH(1, false) },
  },
  {
    id: 'fn5',
    type: 'function',
    parentId: 'f3',
    extent: 'parent',
    position: { x: 16, y: fnY(0) },
    data: { label: 'Button()', complexity: 'low', tags: ['ui'] },
  },
];

const initialEdges = [
  {
    id: 'e1',
    source: 'project1', target: 'comp1',
    type: 'smart',
    data:  { label: 'uses', color: '#a855f7' },
    style: { stroke: '#a855f7', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e2',
    source: 'project1', target: 'comp2',
    type: 'smart',
    data:  { label: 'uses', color: '#a855f7' },
    style: { stroke: '#a855f7', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e3',
    source: 'project1', target: 'comp3',
    type: 'smart',
    data:  { label: 'uses', color: '#a855f7' },
    style: { stroke: '#a855f7', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e4',
    source: 'comp1', target: 'comp2',
    type: 'smart',
    data:  { label: 'imports', color: '#8b5cf6' },
    style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
];

export default function App() {
  const {
    nodes, edges,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    undo, redo, canUndo, canRedo,
  } = useHistory(initialNodes, initialEdges);

  const [selectedEdgeType, setSelectedEdgeType] = useState(EDGE_TYPES.DEFAULT);
  const [selectedNodeId, setSelectedNodeId]     = useState(null);
  const [searchOpen, setSearchOpen]             = useState(false);

  const { addProject, addComponent } = useNodeManager(nodes, setNodes);
  const { handleConnect }            = useEdgeManager(setEdges, selectedEdgeType);

  // ── Bulk select ──
  const selectedNodes  = nodes.filter(n => n.selected);
  const clearSelection = useCallback(() => {
    setNodes(nds => nds.map(n => n.selected ? { ...n, selected: false } : n));
  }, [setNodes]);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;

      // Undo: Ctrl/Cmd + Z
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl/Cmd + Y  or  Ctrl/Cmd + Shift + Z
      if ((mod && e.key === 'y') || (mod && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
      // Search: Ctrl/Cmd + K
      if (mod && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
      // Close search: Escape
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const handlePaneClick = useCallback(() => setSelectedNodeId(null), []);
  const detailOpen = Boolean(selectedNodeId);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#050505' }}>

      <StatsPanel nodes={nodes} edges={edges} />
      <EdgeTypeSelector selectedEdgeType={selectedEdgeType} onEdgeTypeChange={setSelectedEdgeType} />
      <ToolbarPanel onAddProject={addProject} onAddComponent={addComponent} />

      <div style={{
        position: 'absolute', inset: 0,
        right: detailOpen ? 360 : 0,
        transition: 'right 0.22s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <Canvas
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick} onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          canUndo={canUndo} canRedo={canRedo}
          onUndo={undo}     onRedo={redo}
          searchOpen={searchOpen}
          onSearchClose={() => setSearchOpen(false)}
          onAddProject={addProject}
          onAddComponent={addComponent}
        />
      </div>

      <BulkActionsBar
        selectedNodes={selectedNodes}
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        onClear={clearSelection}
      />


      <ExportImportPanel
        nodes={nodes} edges={edges}
        setNodes={setNodes} setEdges={setEdges}
      />

      {/* Search trigger button — always visible */}
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40
                   flex items-center gap-2 px-4 py-2
                   bg-neutral-900/90 backdrop-blur-xl
                   border border-neutral-700/60 rounded-xl
                   text-neutral-500 hover:text-neutral-300
                   text-sm transition-all hover:border-neutral-600
                   shadow-lg shadow-black/30"
        title="Search (Ctrl+K)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span className="hidden sm:inline">Search nodes…</span>
        <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-600">⌘K</kbd>
      </button>

      {detailOpen && (
        <DetailPanel
          selectedNodeId={selectedNodeId}
          nodes={nodes} setNodes={setNodes}
          onClose={(nextNodeId) => {
            // If nextNodeId is passed, it's navigation (prev/next)
            // Otherwise it's a close action
            setSelectedNodeId(nextNodeId || null);
          }}
        />
      )}
    </div>
  );
}