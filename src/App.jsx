import React, { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, MarkerType } from '@xyflow/react';

import { Canvas }          from './components/canvas/Canvas';
import { StatsPanel }      from './components/Panels/StatsPanel';
import { EdgeTypeSelector } from './components/Panels/EdgeTypeSelector';
import { ToolbarPanel }    from './components/Panels/ToolbarPanel';
import { DetailPanel }     from './components/Panels/DetailPanel';

import FunctionNode  from './nodes/FunctionNode';
import FileNode      from './nodes/FileNode';
import ComponentNode from './nodes/ComponentNode';
import ProjectNode   from './nodes/ProjectNode';

import { useNodeManager } from './hooks/useNodeManager';
import { useEdgeManager } from './hooks/useEdgeManager';
import { EDGE_TYPES }     from './utils/constants';

// ─── Layout constants (must match FileNode.jsx) ──────────────────────────────
const FN_SLOT    = 114;   // height per function slot (card + gap)
const FN_START_Y = 90;    // y of first function inside a file node
const fnY = (i) => FN_START_Y + i * FN_SLOT;
const fileHeight = (count) => Math.max(200, FN_START_Y + count * FN_SLOT + 24);
// ─────────────────────────────────────────────────────────────────────────────

const nodeTypes = {
  file:      FileNode,
  function:  FunctionNode,
  component: ComponentNode,
  project:   ProjectNode,
};

const initialNodes = [
  {
    id: 'project1',
    type: 'project',
    position: { x: 100, y: 160 },
    data: {
      label: 'My App',
      description: 'Full-stack web application for user authentication and session management.',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      stage: 'development',
    },
  },
  {
    id: 'comp1',
    type: 'component',
    position: { x: 420, y: 50 },
    data: {
      label: 'Auth Component',
      description: 'Handles all user authentication flows including login, logout, and token refresh.',
      techStack: ['JWT', 'Axios'],
      status: 'stable',
    },
    style: { width: 400, height: 500 },
  },
  {
    id: 'f1',
    type: 'file',
    parentId: 'comp1',
    extent: 'parent',
    position: { x: 25, y: 75 },
    data: {
      label: 'AuthService.ts',
      fileType: 'typescript',
      description: 'Core auth service — API calls, token management, session helpers.',
      exports: ['AuthService', 'useAuth'],
    },
    // height is driven by FileNode's useEffect, but set a reasonable initial value
    style: { width: 300, height: fileHeight(2) },
  },
  {
    id: 'fn1',
    type: 'function',
    parentId: 'f1',
    extent: 'parent',
    position: { x: 20, y: fnY(0) },   // y = 90
    data: {
      label: 'login()',
      description: 'Validates user credentials against the API. Returns a signed JWT on success.',
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
    position: { x: 20, y: fnY(1) },   // y = 204
    data: {
      label: 'logout()',
      description: 'Clears the local session and revokes the current token on the server.',
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

  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNodeId(prev => (prev === node.id ? null : node.id));
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
        />
      </div>

      {detailOpen && (
        <DetailPanel
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          setNodes={setNodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}