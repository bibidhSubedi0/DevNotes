import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FolderGit2, Sparkles, Check, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProjectNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  // Projects are simple nodes - no nested children
  const nodeWidth = 200;
  const nodeHeight = 200;

  const handleSave = () => {
    if (editValue.trim()) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label: editValue.trim() } } : node
        )
      );
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="relative group">
      {/* Outer glow ring */}
      <div className={`
        absolute inset-0 rounded-full transition-all duration-300
        ${selected 
          ? 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30 blur-xl scale-110' 
          : 'bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-lg scale-100 opacity-0 group-hover:opacity-100'
        }
      `} />
      
      {/* Main circle */}
      <div 
        className={`
          relative w-48 h-48 
          bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700
          rounded-full flex flex-col items-center justify-center 
          border-4 transition-all duration-300
          shadow-[0_0_40px_rgba(168,85,247,0.4)]
          ${selected 
            ? 'border-purple-300 scale-105' 
            : 'border-purple-400/80 group-hover:border-purple-300 group-hover:scale-105'
          }
        `}
      >
        
        {/* Sparkle decoration */}
        <div className="absolute -top-2 -right-2 p-1.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
          <Sparkles size={14} className="text-yellow-950" />
        </div>
        
        {/* Icon */}
        <div className="p-3 bg-white/10 rounded-2xl mb-2 backdrop-blur-sm">
          <FolderGit2 size={36} className="text-white drop-shadow-lg" />
        </div>
        
        {/* Label */}
        {isEditing ? (
          <div className="px-4 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-white/20 text-white text-base font-bold px-2 py-1 rounded border-2 border-white focus:outline-none text-center"
            />
            <div className="flex gap-1 justify-center mt-2">
              <button onClick={handleSave} className="p-1.5 bg-green-500 hover:bg-green-400 rounded text-white">
                <Check size={14} />
              </button>
              <button onClick={handleCancel} className="p-1.5 bg-red-500 hover:bg-red-400 rounded text-white">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="text-base font-bold text-white text-center px-4 drop-shadow-md tracking-tight cursor-pointer hover:text-purple-100"
              onDoubleClick={() => { setIsEditing(true); setEditValue(data.label); }}
              title="Double-click to rename"
            >
              {data.label}
            </div>
            
            {/* Subtitle */}
            <div className="text-[10px] uppercase text-purple-100 font-semibold tracking-wider mt-1">
              Project Root
            </div>
          </>
        )}
      </div>
      
      {/* Connection handles - Bidirectional */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !bottom-0 !rounded-full" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !bottom-0 !rounded-full" isConnectable={true} />
      <Handle type="source" position={Position.Top} id="top" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !top-0 !rounded-full" isConnectable={true} />
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !top-0 !rounded-full" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !rounded-full" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !rounded-full" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !rounded-full" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-white !w-5 !h-5 !border-4 !border-purple-500 !shadow-md !shadow-purple-500/30 !rounded-full" isConnectable={true} />
    </div>
  );
}