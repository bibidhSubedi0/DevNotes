import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Cpu, Plus, Check, X } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FILE_W, FILE_GAP_H, FILE_GAP_V, FILE_COLLAPSED_H,
  COMP_HEADER_H, COMP_PAD_H, COMP_MIN_W,
  calcNumCols, layoutFiles,
} from '../utils/layoutConstants';

const validateLabel = (label) => {
  const t = label.trim();
  if (!t)            return { valid: false, error: 'Cannot be empty' };
  if (t.length > 50) return { valid: false, error: 'Max 50 characters' };
  return { valid: true, sanitized: t };
};

export default function ComponentNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const [isEditing, setIsEditing]             = useState(false);
  const [editValue, setEditValue]             = useState(data.label);
  const [validationError, setValidationError] = useState('');
  const [dragWidth, setDragWidth]             = useState(null);
  const lastSigRef = useRef('');

  // Width lives in data.width — always readable as a prop, never undefined
  const savedWidth   = Math.max(COMP_MIN_W, data.width ?? COMP_MIN_W);
  const currentWidth = dragWidth ?? savedWidth;

  const allNodes   = getNodes();
  const childFiles = allNodes.filter(n => n.parentId === id && n.type === 'file');
  
  // Documentation health
  const allFunctions = childFiles.flatMap(file => 
    allNodes.filter(n => n.parentId === file.id && n.type === 'function')
  );
  const docCount = allFunctions.filter(fn => fn.data.description?.trim()).length;
  const docPercent = allFunctions.length > 0 ? Math.round((docCount / allFunctions.length) * 100) : 0;
  const docColor = docPercent === 100 ? 'emerald' : docPercent >= 50 ? 'amber' : 'red';

  const sig = `${Math.round(savedWidth)}|` + childFiles.map(f => {
    const fnCount   = allNodes.filter(n => n.parentId === f.id && n.type === 'function').length;
    const collapsed = f.data?.collapsed === true ? 'c' : 'e';
    return `${f.id}:${collapsed}:${fnCount}`;
  }).join('|');

  const { positions, compHeight } = useMemo(
    () => layoutFiles(childFiles, allNodes, currentWidth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig, currentWidth]
  );

  // Sync file positions + component height when layout changes
  useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;

    setNodes(nodes => {
      const posMap = new Map(positions.map(p => [p.id, p]));
      return nodes.map(node => {
        if (node.id === id)
          return { ...node, style: { ...node.style, width: savedWidth, height: compHeight } };

        if (node.parentId === id && node.type === 'file') {
          const pos = posMap.get(node.id);
          if (!pos) return node;
          return {
            ...node,
            position: { x: pos.x, y: pos.y },
            style:    { ...node.style, width: FILE_W, height: pos.height },
            extent:   [[0, 0], [savedWidth, compHeight]],
          };
        }
        return node;
      });
    });
  }, [sig, positions, compHeight, savedWidth, id, setNodes]);

  // ── Resize handle — native capture listener so ReactFlow can't intercept ──
  const resizeHandleRef = useRef(null);
  const savedWidthRef   = useRef(savedWidth);
  const setNodesRef     = useRef(setNodes);
  savedWidthRef.current = savedWidth;
  setNodesRef.current   = setNodes;

  useEffect(() => {
    const handle = resizeHandleRef.current;
    if (!handle) return;

    const onMouseDown = (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      const startX     = e.clientX;
      const startWidth = savedWidthRef.current;

      const onMove = (moveE) => {
        const w = Math.max(COMP_MIN_W, Math.min(1800, startWidth + (moveE.clientX - startX)));
        setDragWidth(Math.round(w));   // local state = instant visual update
      };

      const onUp = (upE) => {
        const finalW = Math.max(COMP_MIN_W, Math.min(1800, startWidth + (upE.clientX - startX)));
        // Persist into data.width on release
        setNodesRef.current(nodes => nodes.map(n =>
          n.id === id
            ? {
                ...n,
                data:  { ...n.data,  width: Math.round(finalW) },
                style: { ...n.style, width: Math.round(finalW) },
              }
            : n
        ));
        setDragWidth(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    };

    handle.addEventListener('mousedown', onMouseDown, { capture: true });
    return () => handle.removeEventListener('mousedown', onMouseDown, { capture: true });
  }, [id]);

  // ── Add file ──
  const addFile = (evt) => {
    evt.stopPropagation();
    setNodes(nodes => [
      ...nodes,
      {
        id:       `file_${Date.now()}`,
        type:     'file',
        parentId: id,
        extent:   [[0, 0], [currentWidth, compHeight + 300]],
        position: { x: COMP_PAD_H, y: COMP_HEADER_H + FILE_GAP_V },
        data:     { label: 'NewFile.ts', fileType: 'typescript' },
        style:    { width: FILE_W, height: 130 },
      },
    ]);
  };

  // ── Label edit ──
  const handleSave = () => {
    const v = validateLabel(editValue);
    if (!v.valid) { setValidationError(v.error); return; }
    setValidationError('');
    setNodes(nodes => nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, label: v.sanitized } } : n
    ));
    setIsEditing(false);
  };
  const handleCancel  = () => { setEditValue(data.label); setValidationError(''); setIsEditing(false); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); };

  const totalFns = allNodes.filter(
    n => n.type === 'function' && childFiles.some(f => f.id === n.parentId)
  ).length;
  const numCols = calcNumCols(currentWidth);

  return (
    <div
      className={`
        relative bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950
        border-2 rounded-xl shadow-2xl overflow-visible
        transition-[border-color,box-shadow] duration-150
        ${selected
          ? 'border-cyan-400 shadow-cyan-500/30 ring-4 ring-cyan-500/15'
          : 'border-cyan-800 hover:border-cyan-700'}
      `}
      style={{ width: `${currentWidth}px`, height: `${compHeight}px` }}
    >

      {/* ── Right-edge resize handle ── */}
      <div
        ref={resizeHandleRef}
        className="nodrag nopan absolute top-0 right-0 w-4 h-full z-50 cursor-ew-resize
                   flex items-center justify-end group/handle"
        title="Drag to resize"
      >
        <div className="w-0.5 h-full bg-cyan-900/50 group-hover/handle:bg-cyan-600/60 transition-colors" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-1 h-8 rounded-full
                        bg-cyan-700/60 group-hover/handle:bg-cyan-400 group-hover/handle:h-12
                        transition-all duration-150" />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3
                      bg-slate-950/70 border-b border-cyan-900/50 backdrop-blur-sm
                      pointer-events-auto z-10 relative rounded-t-xl">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-cyan-500/15 rounded-lg flex-shrink-0">
            <Cpu size={15} className="text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div>
                <div className="flex items-center gap-1">
                  <input
                    type="text" value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown} autoFocus
                    className="bg-slate-800 text-white text-sm font-bold px-2 py-1 rounded
                               border-2 border-cyan-400 focus:outline-none w-full"
                    onClick={e => e.stopPropagation()}
                  />
                  <button onClick={handleSave}   className="p-1 text-green-400 hover:bg-green-500/20 rounded flex-shrink-0"><Check size={13} /></button>
                  <button onClick={handleCancel} className="p-1 text-red-400   hover:bg-red-500/20   rounded flex-shrink-0"><X size={13} /></button>
                </div>
                {validationError && <p className="text-xs text-red-400 mt-1">{validationError}</p>}
              </div>
            ) : (
              <div className="cursor-pointer" onDoubleClick={e => { e.stopPropagation(); setIsEditing(true); }}>
                <span className="text-sm font-bold text-white tracking-tight">{data.label}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase text-cyan-500 font-semibold tracking-wider">Component</span>
                  <span className="text-[10px] text-neutral-600">{childFiles.length} files · {totalFns} fn</span>
                  {allFunctions.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                      ${docColor === 'emerald' ? 'text-emerald-400 bg-emerald-500/10' :
                        docColor === 'amber'   ? 'text-amber-400 bg-amber-500/10' :
                                                 'text-red-400 bg-red-500/10'}`}
                      title={`${docCount}/${allFunctions.length} functions documented`}
                    >
                      {docPercent}% docs
                    </span>
                  )}
                  {numCols > 1 && <span className="text-[10px] text-cyan-700">{numCols} cols</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dragWidth ? (
            <span className="text-[10px] text-cyan-500 font-mono">{currentWidth}px</span>
          ) : selected ? (
            <span className="text-[10px] text-neutral-700 select-none">drag right edge</span>
          ) : null}
          {!isEditing && (
            <button onClick={addFile}
              className="px-2.5 py-1.5 hover:bg-cyan-500/15 rounded-lg text-cyan-400
                         hover:text-cyan-200 transition-all active:scale-90 flex items-center
                         gap-1.5 border border-transparent hover:border-cyan-800/50">
              <Plus size={14} />
              <span className="text-xs font-semibold">File</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Handles ── */}
      <Handle type="source" position={Position.Top}    id="top"           className="!w-20 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent !rounded-full !-top-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Top}    id="top-target"    className="!w-20 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent !rounded-full !-top-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom"        className="!w-20 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent !rounded-full !-bottom-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-20 !h-2 !bg-gradient-to-r from-transparent via-cyan-400 to-transparent !rounded-full !-bottom-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Left}   id="left"          className="!w-2 !h-14 !bg-gradient-to-b from-transparent via-teal-400 to-transparent !rounded-full !-left-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Left}   id="left-target"   className="!w-2 !h-14 !bg-gradient-to-b from-transparent via-teal-400 to-transparent !rounded-full !-left-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Right}  id="right"         className="!w-2 !h-14 !bg-gradient-to-b from-transparent via-teal-400 to-transparent !rounded-full !-right-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Right}  id="right-target"  className="!w-2 !h-14 !bg-gradient-to-b from-transparent via-teal-400 to-transparent !rounded-full !-right-1 !border-none" isConnectable={true} />
    </div>
  );
}