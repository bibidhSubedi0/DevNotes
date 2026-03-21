import { Handle, Position, useReactFlow } from '@xyflow/react';
import { sanitizeLabel } from '../utils/sanitize';
import { FileCode, Plus, Code2, FileJson, FileType, FileText, Check, X, ChevronRight, ChevronDown, Minus } from 'lucide-react';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  FILE_W_MIN, FILE_W_MAX, FILE_COLLAPSED_H, FILE_MIN_EXP,
  FN_SLOT, FN_START_Y,
  layoutFunctions,
} from '../utils/layoutConstants';

const FN_GAP_MIN   = 40;
const FN_GAP_MAX   = 160;
const FN_GAP_H_MIN = 8;
const FN_GAP_H_MAX = 200;

const fileIcons = {
  typescript: { icon: FileType,  color: 'text-blue-300',   bg: 'bg-blue-500/10' },
  javascript: { icon: FileJson,  color: 'text-yellow-300', bg: 'bg-yellow-500/10' },
  react:      { icon: Code2,     color: 'text-cyan-300',   bg: 'bg-cyan-500/10' },
  python:     { icon: FileText,  color: 'text-green-300',  bg: 'bg-green-500/10' },
  default:    { icon: FileCode,  color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
};

export default function FileNode({ id, data, selected }) {
  const { setNodes, getNodes } = useReactFlow();
  const fileConfig  = fileIcons[data.fileType] || fileIcons.default;
  const Icon        = fileConfig.icon;
  const isCollapsed = data.collapsed === true;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [dragWidth,  setDragWidth]  = useState(null);
  const [dragHeight, setDragHeight] = useState(null);

  const savedWidth  = Math.max(FILE_W_MIN,   data.width  ?? FILE_W_MIN);
  const savedHeight = data.manualHeight ?? null;
  const fnGap       = Math.max(FN_GAP_MIN,   Math.min(FN_GAP_MAX,   data.fnGap  ?? FN_SLOT));
  const fnGapH      = Math.max(FN_GAP_H_MIN, Math.min(FN_GAP_H_MAX, data.fnGapH ?? 16));

  const currentWidth = dragWidth ?? savedWidth;

  const nodes          = getNodes();
  const childFunctions = nodes.filter(n => n.parentId === id && n.type === 'function');
  const fnCount        = childFunctions.length;

  // Multi-column layout — passes both gap overrides
  const { positions: fnPositions, fileHeight: autoHeight } = useMemo(
    () => layoutFunctions(childFunctions, currentWidth, fnGap, fnGapH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fnCount, currentWidth, fnGap, fnGapH, id]
  );

  // Height: collapsed → fixed pill; dragging → drag value; manual set → saved; else auto
  const calculatedHeight = isCollapsed
    ? FILE_COLLAPSED_H
    : dragHeight ?? savedHeight ?? autoHeight;

  const documented    = childFunctions.filter(f => f.data?.description?.trim()).length;
  const coverage      = fnCount === 0 ? 0 : documented / fnCount;
  const docBadgeColor = coverage >= 0.8 ? 'emerald' : coverage >= 0.4 ? 'amber' : 'red';
  const highCount     = childFunctions.filter(f => f.data?.complexity === 'high').length;
  const medCount      = childFunctions.filter(f => f.data?.complexity === 'medium').length;
  const numCols       = fnPositions.length > 1
    ? new Set(fnPositions.map(p => p.x)).size
    : 1;

  // ── Sync positions + notify parent ──
  const lastSigRef = useRef('');
  const sig = `${Math.round(currentWidth)}|${Math.round(calculatedHeight)}|${fnGap}|${fnGapH}|${fnCount}|${isCollapsed ? 'c' : 'e'}`;

  useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;

    setNodes(nodes => {
      const thisNode = nodes.find(n => n.id === id);
      const compId   = thisNode?.parentId;
      const posMap   = new Map(fnPositions.map(p => [p.id, p]));

      return nodes.map(node => {
        if (node.id === id)
          return { ...node, style: { ...node.style, width: savedWidth, height: calculatedHeight } };
        if (node.id === compId)
          return { ...node, data: { ...node.data, _childUpdate: Date.now() } };
        if (node.parentId === id && node.type === 'function' && !isCollapsed) {
          const pos = posMap.get(node.id);
          if (pos) return { ...node, position: { x: pos.x, y: pos.y } };
        }
        return node;
      });
    });
  }, [sig, fnPositions, calculatedHeight, savedWidth, id, setNodes, isCollapsed]);

  // ── Refs for resize handlers ──
  const savedWidthRef   = useRef(savedWidth);
  const savedHeightRef  = useRef(savedHeight ?? autoHeight);
  const setNodesRef     = useRef(setNodes);
  savedWidthRef.current  = savedWidth;
  savedHeightRef.current = savedHeight ?? autoHeight;
  setNodesRef.current    = setNodes;

  // ── Right-edge resize (width) ──
  const rightHandleRef = useRef(null);
  useEffect(() => {
    const handle = rightHandleRef.current;
    if (!handle) return;
    const onMouseDown = (e) => {
      e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
      const startX = e.clientX, startW = savedWidthRef.current;
      const onMove = (me) => setDragWidth(Math.round(Math.max(FILE_W_MIN, Math.min(FILE_W_MAX, startW + (me.clientX - startX)))));
      const onUp   = (ue) => {
        const finalW = Math.round(Math.max(FILE_W_MIN, Math.min(FILE_W_MAX, startW + (ue.clientX - startX))));
        setNodesRef.current(nds => nds.map(n => n.id === id
          ? { ...n, data: { ...n.data, width: finalW }, style: { ...n.style, width: finalW } }
          : n));
        setDragWidth(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };
    handle.addEventListener('mousedown', onMouseDown, { capture: true });
    return () => handle.removeEventListener('mousedown', onMouseDown, { capture: true });
  }, [id]);

  // ── Bottom-edge resize (height) ──
  const bottomHandleRef = useRef(null);
  useEffect(() => {
    const handle = bottomHandleRef.current;
    if (!handle) return;
    const onMouseDown = (e) => {
      e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
      const startY = e.clientY, startH = savedHeightRef.current;
      const onMove = (me) => setDragHeight(Math.round(Math.max(FILE_MIN_EXP, startH + (me.clientY - startY))));
      const onUp   = (ue) => {
        const finalH = Math.round(Math.max(FILE_MIN_EXP, startH + (ue.clientY - startY)));
        setNodesRef.current(nds => nds.map(n => n.id === id
          ? { ...n, data: { ...n.data, manualHeight: finalH }, style: { ...n.style, height: finalH } }
          : n));
        setDragHeight(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };
    handle.addEventListener('mousedown', onMouseDown, { capture: true });
    return () => handle.removeEventListener('mousedown', onMouseDown, { capture: true });
  }, [id]);

  // ── Toggle collapse ──
  const toggleCollapse = useCallback((evt) => {
    evt.stopPropagation();
    const next = !isCollapsed;
    setNodes(nodes => {
      const siblings = nodes.filter(n => n.parentId === id && n.type === 'function')
        .sort((a, b) => a.position.y - b.position.y);
      return nodes.map(n => {
        if (n.id === id) return { ...n, data: { ...n.data, collapsed: next } };
        if (n.parentId === id && n.type === 'function') {
          const idx = siblings.findIndex(s => s.id === n.id);
          const restored = fnPositions[idx];
          return { ...n, position: next
            ? { x: n.position.x, y: 8 }
            : { x: restored?.x ?? 16, y: restored?.y ?? FN_START_Y + idx * fnGap } };
        }
        return n;
      });
    });
  }, [id, isCollapsed, setNodes, fnPositions, fnGap]);

  // ── Add function ──
  const addFunction = useCallback((evt) => {
    evt.stopPropagation();
    setNodes(nodes => {
      const siblings = nodes.filter(n => n.parentId === id && n.type === 'function');
      const allFns   = [...siblings, { id: '__new__' }];
      const { positions, fileHeight: newH } = layoutFunctions(allFns, savedWidthRef.current, fnGap, fnGapH);
      const newPos   = positions[positions.length - 1];
      const compId   = nodes.find(n => n.id === id)?.parentId;
      const updated  = nodes.map(node => {
        if (node.id === id)  return { ...node, style: { ...node.style, height: newH }, data: { ...node.data, manualHeight: null } };
        if (node.id === compId) return { ...node, data: { ...node.data, _childUpdate: Date.now() } };
        return node;
      });
      return [...updated, {
        id: `fn_${Date.now()}`, type: 'function', parentId: id,
        position: { x: newPos?.x ?? 16, y: newPos?.y ?? FN_START_Y + siblings.length * fnGap },
        draggable: true, data: { label: 'newFunction()', description: '' },
      }];
    });
  }, [id, setNodes, fnGap]);

  // ── Spacing controls ──
  const adjustGap = useCallback((delta) => {
    const next = Math.max(FN_GAP_MIN, Math.min(FN_GAP_MAX, fnGap + delta));
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, fnGap: next, manualHeight: null } } : n));
  }, [id, fnGap, setNodes]);

  const adjustGapH = useCallback((delta) => {
    const next = Math.max(FN_GAP_H_MIN, Math.min(FN_GAP_H_MAX, fnGapH + delta));
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, fnGapH: next } } : n));
  }, [id, fnGapH, setNodes]);

  // ── Label edit ──
  const handleSave    = () => { const s = sanitizeLabel(editValue); if (s) setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label: s } } : n)); setIsEditing(false); };
  const handleCancel  = () => { setEditValue(data.label); setIsEditing(false); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); };

  return (
    <div
      className={`
        relative overflow-visible
        bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950
        border-2 rounded-xl shadow-lg
        transition-[border-color] duration-200
        ${selected
          ? 'border-blue-400 shadow-blue-500/30 ring-2 ring-blue-500/20'
          : 'border-blue-800 hover:border-blue-600'}
      `}
      style={{ height: `${calculatedHeight}px`, width: `${currentWidth}px` }}
    >

      {/* ── Right-edge resize handle ── */}
      <div ref={rightHandleRef}
        className="nodrag nopan absolute top-0 right-0 w-4 h-full z-50 cursor-ew-resize
                   flex items-center justify-end group/rhandle"
        title="Drag to resize width">
        <div className="w-0.5 h-full bg-blue-900/50 group-hover/rhandle:bg-blue-500/60 transition-colors" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-1 h-8 rounded-full
                        bg-blue-700/60 group-hover/rhandle:bg-blue-400 group-hover/rhandle:h-12
                        transition-all duration-150" />
      </div>

      {/* ── Bottom-edge resize handle ── */}
      {!isCollapsed && (
        <div ref={bottomHandleRef}
          className="nodrag nopan absolute bottom-0 left-0 w-full h-4 z-50 cursor-ns-resize
                     flex items-end justify-center group/bhandle"
          title="Drag to resize height">
          <div className="h-0.5 w-full bg-blue-900/50 group-hover/bhandle:bg-blue-500/60 transition-colors" />
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full
                          bg-blue-700/60 group-hover/bhandle:bg-blue-400 group-hover/bhandle:w-12
                          transition-all duration-150" />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 pointer-events-auto relative z-10">
        <button onClick={toggleCollapse}
          className="p-0.5 rounded text-blue-500 hover:text-blue-300 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className={`p-1 ${fileConfig.bg} rounded flex-shrink-0`}>
          <Icon size={13} className={fileConfig.color} />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input type="text" value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown} autoFocus
                className="flex-1 min-w-0 bg-blue-800 text-white text-xs font-bold px-2 py-0.5
                           rounded border border-blue-400 focus:outline-none" />
              <button onClick={handleSave}   className="text-green-400 flex-shrink-0"><Check size={11} /></button>
              <button onClick={handleCancel} className="text-neutral-500 flex-shrink-0"><X size={11} /></button>
            </div>
          ) : (
            <span
              className="text-sm font-bold text-white truncate block cursor-pointer hover:text-blue-200"
              onDoubleClick={e => { e.stopPropagation(); setIsEditing(true); setEditValue(data.label); }}
              title="Double-click to rename">
              {data.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(dragWidth || dragHeight) && (
            <span className="text-[10px] text-blue-400 font-mono">
              {currentWidth}×{Math.round(calculatedHeight)}
            </span>
          )}
          {numCols > 1 && <span className="text-[10px] text-blue-600">{numCols} cols</span>}

          {/* Spacing controls — visible when expanded, has functions, and multi-col */}
          {!isCollapsed && fnCount > 0 && !isEditing && (
            <div className="flex items-center gap-1">
              {/* Vertical spacing */}
              <div className="flex items-center gap-0.5 bg-blue-950/60 rounded-lg px-1 border border-blue-900/60"
                title="Vertical spacing between functions">
                <button onClick={() => adjustGap(-8)}
                  className="p-0.5 text-blue-500 hover:text-blue-300 transition-colors"
                  title="Less vertical space">
                  <Minus size={10} />
                </button>
                <span className="text-[10px] font-mono text-blue-500 w-5 text-center select-none">{fnGap}</span>
                <button onClick={() => adjustGap(8)}
                  className="p-0.5 text-blue-500 hover:text-blue-300 transition-colors"
                  title="More vertical space">
                  <Plus size={10} />
                </button>
              </div>
              {/* Horizontal spacing — only useful when multi-column */}
              {numCols > 1 && (
                <div className="flex items-center gap-0.5 bg-blue-950/60 rounded-lg px-1 border border-blue-900/60"
                  title="Horizontal spacing between columns">
                  <button onClick={() => adjustGapH(-8)}
                    className="p-0.5 text-cyan-600 hover:text-cyan-300 transition-colors"
                    title="Less horizontal space">
                    <Minus size={10} />
                  </button>
                  <span className="text-[10px] font-mono text-cyan-600 w-5 text-center select-none">{fnGapH}</span>
                  <button onClick={() => adjustGapH(8)}
                    className="p-0.5 text-cyan-600 hover:text-cyan-300 transition-colors"
                    title="More horizontal space">
                    <Plus size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md
            ${docBadgeColor === 'emerald' ? 'text-emerald-400 bg-emerald-500/10' :
              docBadgeColor === 'amber'   ? 'text-amber-400   bg-amber-500/10'   :
                                            'text-red-400     bg-red-500/10'}`}
            title={`${documented} of ${fnCount} functions documented`}>
            {documented}/{fnCount}
          </span>

          <span className="text-xs font-bold text-blue-500/80 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
            {fnCount} fn
          </span>

          {isCollapsed && (
            <div className="flex items-center gap-0.5">
              {highCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400"   title={`${highCount} high`} />}
              {medCount  > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${medCount} medium`} />}
            </div>
          )}

          {!isCollapsed && !isEditing && (
            <button onClick={addFunction}
              className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-all"
              title="Add function">
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && <div className="h-px bg-blue-900/80 mx-3" />}

      {!isCollapsed && fnCount === 0 && (
        <div className="flex flex-col items-center justify-center py-5 opacity-40 pointer-events-none">
          <Plus size={16} className="text-blue-600 mb-1" />
          <p className="text-[11px] text-blue-600">Click + to add functions</p>
        </div>
      )}

      {/* Handles */}
      <Handle type="source" position={Position.Top}    id="top"           className="!w-16 !h-1.5 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Top}    id="top-target"    className="!w-16 !h-1.5 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-top-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom"        className="!w-16 !h-1.5 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-16 !h-1.5 !bg-gradient-to-r from-transparent via-blue-400 to-transparent !rounded-full !-bottom-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Left}   id="left"          className="!w-1.5 !h-10 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Left}   id="left-target"   className="!w-1.5 !h-10 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-left-1 !border-none" isConnectable={true} />
      <Handle type="source" position={Position.Right}  id="right"         className="!w-1.5 !h-10 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none" isConnectable={true} />
      <Handle type="target" position={Position.Right}  id="right-target"  className="!w-1.5 !h-10 !bg-gradient-to-b from-transparent via-indigo-400 to-transparent !rounded-full !-right-1 !border-none" isConnectable={true} />
    </div>
  );
}