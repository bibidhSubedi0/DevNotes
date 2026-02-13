import React, { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, FileCode, FolderGit2, Layers, GitBranch, Zap, Package } from 'lucide-react';

// Custom Nodes
import FunctionNode from './nodes/FunctionNode';
import FileNode from './nodes/FileNode';
import ComponentNode from './nodes/ComponentNode';
import ProjectNode from './nodes/ProjectNode';

const nodeTypes = {
  file: FileNode,
  function: FunctionNode,
  component: ComponentNode,
  project: ProjectNode,
};

// Edge types for different relationships
const edgeTypes = {
  default: { label: 'calls', color: '#6366f1', animated: true },
  imports: { label: 'imports', color: '#8b5cf6', animated: false },
  extends: { label: 'extends', color: '#ec4899', animated: false },
  dependency: { label: 'depends on', color: '#14b8a6', animated: true },
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
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
  },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeType, setSelectedEdgeType] = useState('default');

  // Create New Project
  const addProject = () => {
    const id = `project_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id,
      type: 'project',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: `Project ${nds.filter(n => n.type === 'project').length + 1}` }
    }));
  };

  // Create New Component
  const addComponent = () => {
    const id = `comp_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id,
      type: 'component',
      position: { x: Math.random() * 600 + 300, y: Math.random() * 400 + 100 },
      data: { label: `Component ${nds.filter(n => n.type === 'component').length + 1}` },
      style: { width: 350, height: 250 }
    }));
  };

  const onConnect = useCallback((params) => {
    const edgeConfig = edgeTypes[selectedEdgeType];
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: edgeConfig.animated, 
      label: edgeConfig.label,
      style: { stroke: edgeConfig.color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeConfig.color },
      labelStyle: { fill: edgeConfig.color, fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#171717', fillOpacity: 0.9 }
    }, eds));
  }, [setEdges, selectedEdgeType]);

  const handleEdgeTypeChange = (type) => {
    setSelectedEdgeType(type);
  };

  return (
    <div className="w-screen h-screen bg-black text-neutral-200 relative overflow-hidden">
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-950 pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #404040 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Top Panel - Stats */}
      <Panel position="top-left" className="m-4">
        <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-indigo-400" />
              <div>
                <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Nodes</div>
                <div className="text-xl font-bold text-white">{nodes.length}</div>
              </div>
            </div>
            <div className="w-px h-10 bg-neutral-600" />
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-purple-400" />
              <div>
                <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Connections</div>
                <div className="text-xl font-bold text-white">{edges.length}</div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Edge Type Selector */}
      <Panel position="top-right" className="m-4">
        <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-xl p-3 shadow-2xl">
          <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-2 flex items-center gap-1.5">
            <Zap size={12} className="text-amber-400" />
            Connection Type
          </div>
          <div className="flex flex-col gap-1.5">
            {Object.entries(edgeTypes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleEdgeTypeChange(key)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left
                  ${selectedEdgeType === key 
                    ? 'bg-neutral-600 text-white shadow-sm' 
                    : 'bg-transparent text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-0.5 rounded-full" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{config.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Floating Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        {/* Instructions */}
        <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-lg px-4 py-2 shadow-xl">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-neutral-300">
              <strong className="text-purple-400">Projects</strong> connect to <strong className="text-amber-400">Components</strong>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">
              <strong className="text-amber-400">Components</strong> contain <strong className="text-blue-400">Files</strong> contain <strong className="text-emerald-400">Functions</strong>
            </span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 p-2.5 bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-2xl shadow-2xl">
          <button 
            onClick={addProject}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/20"
          >
            <FolderGit2 size={16} /> 
            <span>New Project</span>
          </button>
          
          <button 
            onClick={addComponent}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Package size={16} /> 
            <span>New Component</span>
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        className="react-flow-custom"
        connectionRadius={40}
        snapToGrid={false}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background 
          color="#4a4a4a" 
          variant="dots" 
          gap={20} 
          size={2} 
          className="opacity-60"
        />
        <Controls 
          className="bg-neutral-800/95 backdrop-blur-xl border-neutral-600 fill-neutral-200 rounded-xl overflow-hidden shadow-2xl" 
          showInteractive={false}
        />
        <MiniMap 
          className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-600 rounded-xl overflow-hidden shadow-2xl" 
          nodeColor={(node) => {
            if (node.type === 'project') return '#a855f7';
            if (node.type === 'component') return '#f59e0b';
            if (node.type === 'file') return '#3b82f6';
            return '#34d399';
          }}
          maskColor="rgba(0, 0, 0, 0.85)"
        />
      </ReactFlow>
    </div>
  );
}