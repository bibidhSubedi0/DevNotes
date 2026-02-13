import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Box, X, Code, Info, Check, X as XIcon, Edit2 } from 'lucide-react';

export default function FunctionNode({ id, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [labelValue, setLabelValue] = useState(data.label);
  const [descValue, setDescValue] = useState(data.description || '');
  const { setNodes } = useReactFlow();

  const handleLabelSave = () => {
    if (labelValue.trim()) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label: labelValue.trim() } } : node
        )
      );
    }
    setIsEditingLabel(false);
  };

  const handleDescSave = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, description: descValue } } : node
      )
    );
    setIsEditingDesc(false);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setLabelValue(data.label);
      setIsEditingLabel(false);
    }
  };

  const handleDescKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescSave();
    } else if (e.key === 'Escape') {
      setDescValue(data.description || '');
      setIsEditingDesc(false);
    }
  };

  return (
    <div className="relative group">
      {/* Function Pill */}
      <div 
        className="
          flex items-center gap-2 px-4 py-2 
          bg-gradient-to-r from-neutral-700 to-neutral-700/90 
          border-2 border-emerald-500/60 rounded-lg 
          shadow-lg shadow-emerald-500/30
          hover:border-emerald-400 hover:shadow-emerald-400/40
          transition-all duration-200 
          min-w-[160px] backdrop-blur-sm
        "
      >
        <div className="p-1 bg-emerald-500/20 rounded">
          <Code size={12} className="text-emerald-300" />
        </div>
        {isEditingLabel ? (
          <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              autoFocus
              className="bg-neutral-800 text-white text-xs font-mono font-semibold px-1.5 py-0.5 rounded border-2 border-emerald-400 focus:outline-none flex-1"
            />
            <button onClick={handleLabelSave} className="p-0.5 hover:bg-green-500/20 rounded text-green-400">
              <Check size={12} />
            </button>
            <button onClick={() => { setLabelValue(data.label); setIsEditingLabel(false); }} className="p-0.5 hover:bg-red-500/20 rounded text-red-400">
              <XIcon size={12} />
            </button>
          </div>
        ) : (
          <>
            <span 
              className="text-xs font-mono font-semibold text-white truncate flex-1 cursor-pointer hover:text-emerald-200"
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsEditingLabel(true); 
                setLabelValue(data.label); 
              }}
              title="Click to rename"
            >
              {data.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
              className="px-2 py-1 hover:bg-emerald-500/20 rounded transition-colors flex items-center gap-1"
              title="View/Edit details"
            >
              <Info size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">Info</span>
            </button>
          </>
        )}
      </div>

      {/* Connection Handles - All bidirectional, subtle glow */}
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-target"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right-target"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top-target"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !shadow-md !shadow-emerald-500/30 !rounded-full"
        isConnectable={true}
      />

      {/* Documentation Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          />
          
          {/* Popup */}
          <div 
            className="absolute left-0 bottom-full mb-2 w-72 bg-neutral-700/98 backdrop-blur-xl border-2 border-emerald-400 rounded-xl shadow-2xl shadow-emerald-500/20 z-50 overflow-hidden"
            style={{
              animation: 'slideInUp 0.2s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-emerald-800/60 to-transparent border-b border-emerald-400/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Code size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-100 font-mono">{data.label}</div>
                  <div className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">Function Details</div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={14} className="text-neutral-400 hover:text-white" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-4 py-4">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                    Description
                  </div>
                  {!isEditingDesc && (
                    <button
                      onClick={() => { setIsEditingDesc(true); setDescValue(data.description || ''); }}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-emerald-400"
                      title="Edit description"
                    >
                      <Edit2 size={10} />
                    </button>
                  )}
                </div>
                {isEditingDesc ? (
                  <div>
                    <textarea
                      value={descValue}
                      onChange={(e) => setDescValue(e.target.value)}
                      onKeyDown={handleDescKeyDown}
                      autoFocus
                      rows={3}
                      className="w-full bg-neutral-800 text-neutral-100 text-sm px-2 py-1.5 rounded border border-emerald-500 focus:outline-none resize-none"
                      placeholder="Add function description..."
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={handleDescSave}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setDescValue(data.description || ''); setIsEditingDesc(false); }}
                        className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded"
                      >
                        Cancel
                      </button>
                      <span className="text-[10px] text-neutral-500 self-center ml-auto">Ctrl+Enter to save</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {data.description || "No documentation provided for this function."}
                  </p>
                )}
              </div>
              
              {/* Additional metadata could go here */}
              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <Box size={10} />
                  <span>Click outside to close</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
