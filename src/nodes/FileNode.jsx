import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FileCode, Plus, Code2, FileJson, FileType, FileText, Check, X } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

const fileIcons = {
  typescript: { icon: FileType, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  javascript: { icon: FileJson, color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  react: { icon: Code2, color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  python: { icon: FileText, color: 'text-green-300', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  default: { icon: FileCode, color: 'text-indigo-300', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
};

export default function FileNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const fileConfig = fileIcons[data.fileType] || fileIcons.default;
  const Icon = fileConfig.icon;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  // Calculate dynamic height based on number of child functions
  const nodes = getNodes();
  const childFunctions = nodes.filter(n => n.parentId === id);
  const minHeight = 200;
  const headerHeight = 52;
  const functionHeight = 45;
  const padding = 30;
  const calculatedHeight = Math.max(minHeight, headerHeight + (childFunctions.length * functionHeight) + padding);

  // Update parent component size when this file's size changes
  useEffect(() => {
    setNodes((nodes) => {
      const thisNode = nodes.find(n => n.id === id);
      if (thisNode?.parentId) {
        // Trigger parent recalculation by updating timestamp
        return nodes.map(n => n.id === thisNode.parentId ? { ...n, data: { ...n.data, lastUpdate: Date.now() } } : n);
      }
      return nodes;
    });
  }, [childFunctions.length, id, setNodes]);

  const addFunction = useCallback((evt) => {
    evt.stopPropagation();
    const newFnId = `fn_${Date.now()}`;
    
    setNodes((nodes) => {
      const childFunctions = nodes.filter(n => n.parentId === id);
      return [
        ...nodes,
        {
          id: newFnId,
          type: 'function',
          parentId: id,
          extent: 'parent',
          position: { x: 20, y: 65 + (childFunctions.length * 45) },
          data: { label: 'newFunction()', description: 'Add your logic here...' }
        }
      ];
    });
  }, [id, setNodes]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(data.label);
  };

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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      className={`
        relative min-w-[280px]
        bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950
        border-2 rounded-xl transition-all shadow-2xl group overflow-hidden
        ${selected 
          ? 'border-blue-400 shadow-blue-500/40 ring-4 ring-blue-500/30' 
          : 'border-blue-600 hover:border-blue-500'
        }
      `}
      style={{ height: `${calculatedHeight}px` }}
    >
      
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 ${fileConfig.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`} />
      
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-blue-950/60 border-b border-blue-700 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`p-1.5 ${fileConfig.bg} rounded-lg flex-shrink-0`}>
            <Icon size={16} className={fileConfig.color} />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-blue-800 text-white text-sm font-bold px-2 py-1 rounded border-2 border-blue-400 focus:outline-none w-full"
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={handleSave} className="p-1 hover:bg-green-500/20 rounded text-green-400">
                  <Check size={14} />
                </button>
                <button onClick={handleCancel} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
                <span className="text-sm font-bold text-white tracking-tight">{data.label}</span>
                <div className="text-[10px] uppercase text-blue-300 font-semibold tracking-wider">
                  {data.fileType || 'file'} • double-click to rename
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Add Button - Larger hit area */}
        {!isEditing && (
          <button 
            onClick={addFunction}
            className="px-3 py-2 hover:bg-blue-500/20 rounded-lg text-blue-300 hover:text-blue-200 transition-all active:scale-90 border border-transparent hover:border-blue-600/50 flex-shrink-0 flex items-center gap-1.5"
            title="Add Function"
          >
            <Plus size={16} />
            <span className="text-xs font-semibold">Add Func</span>
          </button>
        )}
      </div>

      {/* Empty state hint */}
      <div className="absolute inset-x-0 bottom-0 top-[52px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="text-center px-4">
          <Plus size={20} className="mx-auto mb-1 text-blue-600" />
          <p className="text-[11px] text-blue-600 font-medium">Click + to add functions</p>
        </div>
      </div>

      {/* Connection Points - Bidirectional */}
      <Handle type="source" position={Position.Top} id="top" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Top} id="top-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-blue-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-indigo-500/20" isConnectable={true} />
    </div>
  );
}