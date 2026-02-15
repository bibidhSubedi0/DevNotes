import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FileCode, Plus, Code2, FileJson, FileType, FileText, Check, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import {
  FILE_W, FILE_COLLAPSED_H, FILE_MIN_EXP,
  FN_SLOT, FN_START_Y, FILE_PAD_B,
  calcFileH, fnY,
} from '../utils/layoutConstants';

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

  // collapsed === true means collapsed; absent or false means expanded
  const isCollapsed = data.collapsed === true;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  const nodes          = getNodes();
  const childFunctions = nodes.filter(n => n.parentId === id && n.type === 'function');
  const fnCount        = childFunctions.length;
  const calculatedHeight = calcFileH(fnCount, isCollapsed);

  // Sync file height + notify parent on change
  useEffect(() => {
    setNodes(nodes => {
      const thisNode = nodes.find(n => n.id === id);
      const parentId = thisNode?.parentId;
      return nodes.map(node => {
        if (node.id === id)
          return { ...node, style: { ...node.style, height: calculatedHeight, width: FILE_W } };
        if (node.id === parentId)
          return { ...node, data: { ...node.data, _childUpdate: Date.now() } };
        return node;
      });
    });
  }, [calculatedHeight, id, setNodes, fnCount, isCollapsed]);

  // ── Toggle collapse ──
  // Collapsed: functions move to y=8 (still exist, edges draw to file header)
  // Expanded:  functions restore to their proper y positions
  const toggleCollapse = useCallback((evt) => {
    evt.stopPropagation();
    const next = !isCollapsed;
    setNodes(nodes => {
      const siblings = nodes
        .filter(n => n.parentId === id && n.type === 'function')
        .sort((a, b) => a.position.y - b.position.y);

      return nodes.map(n => {
        if (n.id === id)
          return { ...n, data: { ...n.data, collapsed: next } };

        if (n.parentId === id && n.type === 'function') {
          const idx = siblings.findIndex(s => s.id === n.id);
          return {
            ...n,
            position: next
              ? { x: n.position.x, y: 8 }        // cluster at header when collapsed
              : { x: n.position.x, y: fnY(idx) }, // restore real positions when expanded
          };
        }
        return n;
      });
    });
  }, [id, isCollapsed, setNodes]);

  // ── Add function ──
  const addFunction = useCallback((evt) => {
    evt.stopPropagation();
    setNodes(nodes => {
      const siblings  = nodes.filter(n => n.parentId === id && n.type === 'function');
      const newCount  = siblings.length + 1;
      const newHeight = calcFileH(newCount, false);
      const updated   = nodes.map(node =>
        node.id === id ? { ...node, style: { ...node.style, height: newHeight } } : node
      );
      return [
        ...updated,
        {
          id:       `fn_${Date.now()}`,
          type:     'function',
          parentId: id,
          position: { x: 16, y: fnY(siblings.length) },
          extent:   [[0, 50], [FILE_W, newHeight]],
          draggable: true,
          data:     { label: 'newFunction()', description: '' },
        },
      ];
    });
  }, [id, setNodes]);

  // ── Label edit ──
  const handleSave   = () => {
    if (editValue.trim())
      setNodes(nodes => nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, label: editValue.trim() } } : n
      ));
    setIsEditing(false);
  };
  const handleCancel  = () => { setEditValue(data.label); setIsEditing(false); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const highCount = childFunctions.filter(f => f.data?.complexity === 'high').length;
  const medCount  = childFunctions.filter(f => f.data?.complexity === 'medium').length;

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950
        border-2 rounded-xl shadow-lg
        transition-[border-color,height] duration-200
        ${selected
          ? 'border-blue-400 shadow-blue-500/30 ring-2 ring-blue-500/20'
          : 'border-blue-800 hover:border-blue-600'}
      `}
      style={{ height: `${calculatedHeight}px`, width: `${FILE_W}px` }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 pointer-events-auto relative z-10">

        {/* Collapse chevron */}
        <button
          onClick={toggleCollapse}
          className="p-0.5 rounded text-blue-500 hover:text-blue-300 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Icon */}
        <div className={`p-1 ${fileConfig.bg} rounded flex-shrink-0`}>
          <Icon size={13} className={fileConfig.color} />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input
                type="text" value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown} autoFocus
                className="flex-1 min-w-0 bg-blue-800 text-white text-xs font-bold px-2 py-0.5
                           rounded border border-blue-400 focus:outline-none"
              />
              <button onClick={handleSave}   className="text-green-400 flex-shrink-0"><Check size={11} /></button>
              <button onClick={handleCancel} className="text-neutral-500 flex-shrink-0"><X size={11} /></button>
            </div>
          ) : (
            <span
              className="text-xs font-bold text-white truncate block cursor-pointer hover:text-blue-200"
              onDoubleClick={e => { e.stopPropagation(); setIsEditing(true); setEditValue(data.label); }}
              title="Double-click to rename"
            >
              {data.label}
            </span>
          )}
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold text-blue-500/80 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
            {fnCount} fn
          </span>

          {/* Complexity dots shown when collapsed so you can see what's inside */}
          {isCollapsed && (
            <div className="flex items-center gap-0.5">
              {highCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400"   title={`${highCount} high`} />}
              {medCount  > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${medCount} medium`} />}
            </div>
          )}

          {/* Add fn — only when expanded */}
          {!isCollapsed && !isEditing && (
            <button
              onClick={addFunction}
              className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-all"
              title="Add function"
            >
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Divider when expanded */}
      {!isCollapsed && <div className="h-px bg-blue-900/80 mx-3" />}

      {/* Empty state */}
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