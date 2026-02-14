import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FolderGit2, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { validateNodeLabel } from '../utils/validation';

export default function ProjectNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [validationError, setValidationError] = useState('');

  const handleSave = () => {
    const validation = validateNodeLabel(editValue);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: validation.value } } : node
      )
    );
    setIsEditing(false);
    setValidationError('');
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setIsEditing(false);
    setValidationError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <div className="relative group">
      {/* ERROR BANNER AT TOP OF SCREEN */}
      {validationError && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl border-4 border-white"
          style={{ minWidth: '300px' }}
        >
          <div className="flex items-center gap-3 text-lg font-bold">
            <AlertCircle size={28} />
            <div>
              <div className="text-xl">⚠️ VALIDATION ERROR</div>
              <div className="text-sm font-normal mt-1">{validationError}</div>
            </div>
          </div>
        </div>
      )}

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
          ${validationError ? 'ring-8 ring-red-500 ring-offset-4' : ''}
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
          <div className="px-4 w-full flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={50}
              className={`
                w-full bg-white/20 text-white text-base font-bold px-2 py-1 rounded 
                border-4 focus:outline-none text-center
                ${validationError ? 'border-red-500 bg-red-500/30' : 'border-white'}
              `}
            />
            
            {/* Inline error message */}
            {validationError && (
              <div className="flex items-center gap-2 text-xs font-bold text-white bg-red-600 px-3 py-2 rounded-lg shadow-xl border-2 border-white">
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <button 
                onClick={handleSave} 
                className="px-3 py-2 bg-green-500 hover:bg-green-400 rounded-lg text-white font-bold transition-colors shadow-lg"
                title="Save"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={handleCancel} 
                className="px-3 py-2 bg-red-500 hover:bg-red-400 rounded-lg text-white font-bold transition-colors shadow-lg"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="text-base font-bold text-white text-center px-4 drop-shadow-md tracking-tight cursor-pointer hover:text-purple-100"
              onDoubleClick={() => { 
                setIsEditing(true); 
                setEditValue(data.label);
                setValidationError(''); 
              }}
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