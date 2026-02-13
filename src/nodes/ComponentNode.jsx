import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Package, Plus, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ComponentNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  // Calculate dynamic size based on ALL nested children (files and their functions)
  const nodes = getNodes();
  const childFiles = nodes.filter(n => n.parentId === id && n.type === 'file');
  
  // Calculate total height needed for all files
  let totalHeight = 80; // Header + padding
  childFiles.forEach(file => {
    const fileFunctions = nodes.filter(n => n.parentId === file.id);
    const fileHeight = Math.max(200, 52 + (fileFunctions.length * 45) + 30);
    totalHeight += fileHeight + 20; // File height + spacing
  });

  const minHeight = 250;
  const calculatedHeight = Math.max(minHeight, totalHeight);
  const calculatedWidth = 350;

  // Update node dimensions when children change
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, style: { ...node.style, width: calculatedWidth, height: calculatedHeight } }
          : node
      )
    );
  }, [calculatedHeight, calculatedWidth, id, setNodes]);

  const addFile = (evt) => {
    evt.stopPropagation();
    const newFileId = `file_${Date.now()}`;
    const currentFiles = childFiles.length;
    
    setNodes((nodes) => [
      ...nodes,
      {
        id: newFileId,
        type: 'file',
        parentId: id,
        extent: 'parent',
        position: { x: 20, y: 70 + (currentFiles * 220) },
        data: { label: 'NewFile.ts', fileType: 'typescript' },
        style: { width: 310 }
      }
    ]);
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
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') handleCancel();
  };

  return (
    <div 
      className={`
        relative
        bg-gradient-to-br from-amber-800 via-amber-900 to-orange-900
        border-2 rounded-xl transition-all shadow-2xl group overflow-visible
        ${selected 
          ? 'border-amber-400 shadow-amber-500/40 ring-4 ring-amber-500/30' 
          : 'border-amber-600 hover:border-amber-500'
        }
      `}
      style={{ width: `${calculatedWidth}px`, height: `${calculatedHeight}px` }}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-amber-950/60 border-b border-amber-700 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-amber-500/20 rounded-lg flex-shrink-0">
            <Package size={16} className="text-amber-300" />
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
                  className="bg-amber-800 text-white text-sm font-bold px-2 py-1 rounded border-2 border-amber-400 focus:outline-none w-full"
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
              <div onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="cursor-pointer">
                <span className="text-sm font-bold text-white tracking-tight">{data.label}</span>
                <div className="text-[10px] uppercase text-amber-300 font-semibold tracking-wider">
                  Component • double-click to rename
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <button 
            onClick={addFile}
            className="px-3 py-2 hover:bg-amber-500/20 rounded-lg text-amber-300 hover:text-amber-200 transition-all active:scale-90 border border-transparent hover:border-amber-600/50 flex-shrink-0 flex items-center gap-1.5"
            title="Add File"
          >
            <Plus size={16} />
            <span className="text-xs font-semibold">Add File</span>
          </button>
        )}
      </div>

      {/* Connection Handles - Bidirectional */}
      <Handle type="source" position={Position.Top} id="top" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-amber-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-amber-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Top} id="top-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-amber-400 to-transparent !rounded-full !-top-1 !border-none !shadow-sm !shadow-amber-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-amber-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-amber-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-amber-400 to-transparent !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-amber-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-orange-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-orange-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-orange-400 to-transparent !rounded-full !-left-1 !border-none !shadow-sm !shadow-orange-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-orange-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-orange-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-orange-400 to-transparent !rounded-full !-right-1 !border-none !shadow-sm !shadow-orange-500/20" isConnectable={true} />
    </div>
  );
}
