import React, { useState } from 'react';
import { useNodesState, useEdgesState, MarkerType } from '@xyflow/react';

// Components
import { Canvas } from './components/canvas/Canvas';
import { StatsPanel } from './components/Panels/StatsPanel';
import { EdgeTypeSelector } from './components/Panels/EdgeTypeSelector';
import { ToolbarPanel } from './components/Panels/ToolbarPanel';

// Nodes
import FunctionNode from './nodes/FunctionNode';
import FileNode from './nodes/FileNode';
import ComponentNode from './nodes/ComponentNode';
import ProjectNode from './nodes/ProjectNode';

// Hooks
import { useNodeManager } from './hooks/useNodeManager';
import { useEdgeManager } from './hooks/useEdgeManager';

// Constants
import { EDGE_TYPES } from './utils/constants';

const nodeTypes = {
  file: FileNode,
  function: FunctionNode,
  component: ComponentNode,
  project: ProjectNode,
};

const initialNodes = [
  { 
    id: 'project1', 
    type: 'project', 
    position: { x: 100, y: 100 }, 
    data: { label: 'My App' },
  },
  { 
    id: 'comp1', 
    type: 'component', 
    position: { x: 400, y: 50 }, 
    data: { label: 'Auth Component' },
    style: { width: 350, height: 450 }
  },
  { 
    id: 'f1', 
    type: 'file', 
    parentId: 'comp1',
    extent: 'parent',
    position: { x: 20, y: 70 }, 
    data: { label: 'AuthService.ts', fileType: 'typescript' },
    style: { width: 310 }
  },
  { 
    id: 'fn1', 
    type: 'function', 
    parentId: 'f1', 
    extent: 'parent', 
    position: { x: 20, y: 65 }, 
    data: { label: 'login()', description: 'Validates user credentials against API. Returns JWT token on success.' } 
  },
  { 
    id: 'fn2', 
    type: 'function', 
    parentId: 'f1', 
    extent: 'parent', 
    position: { x: 20, y: 110 }, 
    data: { label: 'logout()', description: 'Clears session and revokes tokens.' } 
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
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }  // ← fixed
  },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeType, setSelectedEdgeType] = useState(EDGE_TYPES.DEFAULT);

  const { addProject, addComponent } = useNodeManager(nodes, setNodes);
  const { handleConnect } = useEdgeManager(setEdges, selectedEdgeType);

  return (
    // ↓ this is the div — the very first one returned
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#050505' }}>
      
      <StatsPanel nodes={nodes} edges={edges} />
      <EdgeTypeSelector 
        selectedEdgeType={selectedEdgeType} 
        onEdgeTypeChange={setSelectedEdgeType} 
      />
      <ToolbarPanel 
        onAddProject={addProject} 
        onAddComponent={addComponent} 
      />

      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
      />
    </div>
  );
}