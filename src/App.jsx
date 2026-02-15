import React, { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, MarkerType } from '@xyflow/react';

import { Canvas }           from './components/canvas/Canvas';
import { StatsPanel }       from './components/Panels/StatsPanel';
import { EdgeTypeSelector } from './components/Panels/EdgeTypeSelector';
import { ToolbarPanel }     from './components/Panels/ToolbarPanel';
import { DetailPanel }      from './components/Panels/DetailPanel';
import { BulkActionsBar }   from './components/Panels/BulkActionsBar';

import FunctionNode  from './nodes/FunctionNode';
import FileNode      from './nodes/FileNode';
import ComponentNode from './nodes/ComponentNode';
import ProjectNode   from './nodes/ProjectNode';

import { useNodeManager } from './hooks/useNodeManager';
import { useEdgeManager } from './hooks/useEdgeManager';
import { EDGE_TYPES }     from './utils/constants';
import {
  FILE_W, FILE_COLLAPSED_H, COMP_PAD_H, COMP_HEADER_H, FILE_GAP_V,
  fnY, calcFileH, FILE_MIN_EXP,
} from './utils/layoutConstants';

const nodeTypes = {
  file:      FileNode,
  function:  FunctionNode,
  component: ComponentNode,
  project:   ProjectNode,
};

// Initial component width — single column
const INIT_COMP_W = 360;

const initialNodes = [
  {
    id: 'project1',
    type: 'project',
    position: { x: 60, y: 180 },
    data: {
      label: 'My App',
      description: 'Full-stack web application for user authentication.',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      stage: 'development',
    },
  },
  {
    id: 'comp1',
    type: 'component',
    position: { x: 360, y: 60 },
    data: {
      width: 360,
      label: 'Auth Component',
      description: 'Handles all authentication flows — login, logout, token refresh.',
      techStack: ['JWT', 'Axios'],
      status: 'stable',
    },
    // Height = header + gap + file height (2 fns expanded)
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
    data: {
      label: 'AuthService.ts',
      fileType: 'typescript',
      description: 'Core auth service — API calls, token management.',
      exports: ['AuthService', 'useAuth'],
      // No collapsed flag = expanded by default
    },
    style: { width: FILE_W, height: calcFileH(2, false) },
  },
  {
    id: 'fn1',
    type: 'function',
    parentId: 'f1',
    extent: 'parent',
    position: { x: 16, y: fnY(0) },
    data: {
      label: 'login()',
      description: 'Validates credentials. Returns signed JWT on success.',
      params: ['email: string', 'password: string'],
      returns: 'Promise<{ token: string }>',
      complexity: 'medium',
      tags: ['auth', 'async', 'critical'],
    },
  },
  {
    id: 'fn2',
    type: 'function',
    parentId: 'f1',
    extent: 'parent',
    position: { x: 16, y: fnY(1) },
    data: {
      label: 'logout()',
      description: 'Clears session and revokes token on the server.',
      params: [],
      returns: 'void',
      complexity: 'low',
      tags: ['auth'],
    },
  },
];

const initialEdges = [
  {
    id: 'e1',
    source: 'project1',
    target: 'comp1',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeType, setSelectedEdgeType] = useState(EDGE_TYPES.DEFAULT);
  const [selectedNodeId, setSelectedNodeId]     = useState(null);

  const { addProject, addComponent } = useNodeManager(nodes, setNodes);
  const { handleConnect }            = useEdgeManager(setEdges, selectedEdgeType);

  // ── Multi-select / bulk state ──
  const selectedNodes = nodes.filter(n => n.selected);
  const clearSelection = useCallback(() => {
    setNodes(nds => nds.map(n => n.selected ? { ...n, selected: false } : n));
  }, [setNodes]);

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
        />
      </div>

      <BulkActionsBar
        selectedNodes={selectedNodes}
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        onClear={clearSelection}
      />

      {detailOpen && (
        <DetailPanel
          selectedNodeId={selectedNodeId}
          nodes={nodes} setNodes={setNodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}