import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Cpu, Plus, Check, X } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';

// Simple validation utility to prevent XSS
const validateNodeLabel = (label) => {
  const trimmed = label.trim();
  if (!trimmed) return { valid: false, error: 'Label cannot be empty' };
  if (trimmed.length > 50) return { valid: false, error: 'Label too long (max 50 characters)' };
  if (/<script|javascript:/i.test(trimmed)) return { valid: false, error: 'Invalid characters detected' };
  return { valid: true, sanitized: trimmed };
};

export default function ComponentNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [validationError, setValidationError] = useState('');

  // Prevent infinite loop
  const lastUpdateRef = useRef({ height: 0, width: 0, fileCount: 0, functionCount: 0 });

  // Pre-calculate file info
  const nodes = getNodes();
  const childFiles = nodes.filter(n => n.parentId === id && n.type === 'file');

  const totalFunctionCount = childFiles.reduce((sum, file) => {
    return sum + nodes.filter(n => n.parentId === file.id).length;
  }, 0);

  // Calculate positions once
  const filePositions = useMemo(() => {
    let currentY = 95;
    return childFiles.map(file => {
      const fileFunctions = nodes.filter(n => n.parentId === file.id);
      const fileHeight = Math.max(240, 70 + (fileFunctions.length * 65) + 50);
      const position = { id: file.id, y: currentY, height: fileHeight };
      currentY += fileHeight + 30;
      return position;
    });
  }, [childFiles.length, totalFunctionCount]);

  // Calculate total height
  let totalHeight = 100;
  filePositions.forEach(pos => { totalHeight += pos.height + 30; });

  const calculatedHeight = Math.max(300, totalHeight);
  const calculatedWidth  = 400;

  // Update node dimensions — with loop prevention
  useEffect(() => {
    const last = lastUpdateRef.current;
    if (
      last.height === calculatedHeight &&
      last.width  === calculatedWidth  &&
      last.fileCount     === childFiles.length &&
      last.functionCount === totalFunctionCount
    ) return;

    lastUpdateRef.current = {
      height: calculatedHeight,
      width:  calculatedWidth,
      fileCount:     childFiles.length,
      functionCount: totalFunctionCount,
    };

    setNodes((nodes) => {
      const posMap = new Map(filePositions.map(p => [p.id, p]));
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, style: { ...node.style, width: calculatedWidth, height: calculatedHeight } };
        }
        if (node.parentId === id && node.type === 'file') {
          const pos = posMap.get(node.id);
          if (pos) {
            return {
              ...node,
              position: { ...node.position, y: pos.y },
              style:    { ...node.style, height: pos.height },
              extent: [[0, 0], [calculatedWidth, calculatedHeight]],
            };
          }
        }
        return node;
      });
    });
  }, [calculatedHeight, calculatedWidth, childFiles.length, totalFunctionCount, id, setNodes, filePositions]);

  const addFile = (evt) => {
    evt.stopPropagation();
    const newFileId = `file_${Date.now()}`;

    let yPosition = 95;
    filePositions.forEach(pos => { yPosition = pos.y + pos.height + 30; });

    const newHeight = Math.max(300, calculatedHeight + 270);

    setNodes((nodes) => {
      const updatedNodes = nodes.map(node => {
        if (node.id === id) return { ...node, style: { ...node.style, height: newHeight } };
        return node;
      });
      return [
        ...updatedNodes,
        {
          id: newFileId,
          type: 'file',
          parentId: id,
          extent: [[0, 0], [calculatedWidth, newHeight]],
          position: { x: 25, y: yPosition },
          data: { label: 'NewFile.ts', fileType: 'typescript' },
          style: { width: 300, height: 240 },
        },
      ];
    });
  };

  const handleSave = () => {
    const validation = validateNodeLabel(editValue);
    if (!validation.valid) { setValidationError(validation.error); return; }
    setValidationError('');
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: validation.sanitized } } : node
      )
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setValidationError('');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div
      className={`
        relative
        bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950
        border-2 rounded-xl transition-all shadow-2xl group overflow-visible
        ${selected
          ? 'border-cyan-400 shadow-cyan-500/30 ring-4 ring-cyan-500/20'
          : 'border-cyan-700 hover:border-cyan-500'}
      `}
      style={{ width: `${calculatedWidth}px`, height: `${calculatedHeight}px` }}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3
                      bg-slate-950/70 border-b border-cyan-900/60
                      backdrop-blur-sm pointer-events-auto z-10">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-cyan-500/15 rounded-lg flex-shrink-0">
            <Cpu size={16} className="text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="bg-slate-800 text-white text-sm font-bold px-2 py-1 rounded
                               border-2 border-cyan-400 focus:outline-none w-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={handleSave}
                    className="p-1 hover:bg-green-500/20 rounded text-green-400">
                    <Check size={14} />
                  </button>
                  <button onClick={handleCancel}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400">
                    <X size={14} />
                  </button>
                </div>
                {validationError && (
                  <div className="text-xs text-red-400 mt-1">{validationError}</div>
                )}
              </div>
            ) : (
              <div onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                   className="cursor-pointer">
                <span className="text-base font-bold text-white tracking-tight">{data.label}</span>
                <div className="text-xs uppercase text-cyan-400 font-semibold tracking-wider">
                  Component · double-click to rename
                </div>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={addFile}
            className="px-3 py-2 hover:bg-cyan-500/15 rounded-lg text-cyan-300 hover:text-cyan-200
                       transition-all active:scale-90 border border-transparent
                       hover:border-cyan-700/50 flex-shrink-0 flex items-center gap-1.5"
            title="Add File"
          >
            <Plus size={16} />
            <span className="text-xs font-semibold">Add File</span>
          </button>
        )}
      </div>

      {/* Handles */}
      <Handle type="source" position={Position.Top}    id="top"
        className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                   !rounded-full !-top-1 !border-none !shadow-sm !shadow-cyan-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Top}    id="top-target"
        className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                   !rounded-full !-top-1 !border-none !shadow-sm !shadow-cyan-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom"
        className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                   !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-cyan-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target"
        className="!w-24 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                   !rounded-full !-bottom-1 !border-none !shadow-sm !shadow-cyan-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Left}   id="left"
        className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-teal-400 to-transparent
                   !rounded-full !-left-1 !border-none !shadow-sm !shadow-teal-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Left}   id="left-target"
        className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-teal-400 to-transparent
                   !rounded-full !-left-1 !border-none !shadow-sm !shadow-teal-500/20" isConnectable={true} />
      <Handle type="source" position={Position.Right}  id="right"
        className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-teal-400 to-transparent
                   !rounded-full !-right-1 !border-none !shadow-sm !shadow-teal-500/20" isConnectable={true} />
      <Handle type="target" position={Position.Right}  id="right-target"
        className="!w-2 !h-16 !bg-gradient-to-b from-transparent via-teal-400 to-transparent
                   !rounded-full !-right-1 !border-none !shadow-sm !shadow-teal-500/20" isConnectable={true} />
    </div>
  );
}