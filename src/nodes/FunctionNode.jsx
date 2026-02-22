import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Code2, Check, X } from 'lucide-react';

const COMPLEXITY_STYLE = {
  low:    { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  medium: { icon: 'text-amber-400',   bg: 'bg-amber-500/10',   dot: 'bg-amber-400'   },
  high:   { icon: 'text-red-400',     bg: 'bg-red-500/10',     dot: 'bg-red-400'     },
};

export default function FunctionNode({ id, data, selected }) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue]         = useState(data.label);
  const { setNodes } = useReactFlow();

  const saveLabel = () => {
    const trimmed = labelValue.trim();
    if (trimmed)
      setNodes(nodes => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n));
    else
      setLabelValue(data.label);
    setIsEditingLabel(false);
  };
  const cancelLabel = () => { setLabelValue(data.label); setIsEditingLabel(false); };
  const onKeyDown   = (e) => {
    if (e.key === 'Enter')  { e.stopPropagation(); saveLabel();   }
    if (e.key === 'Escape') { e.stopPropagation(); cancelLabel(); }
  };

  const cx = COMPLEXITY_STYLE[data.complexity];
  const isEmpty = !data.description?.trim();

  return (
    <div className="relative">
      <div className={`
        flex items-center gap-2 px-3 py-2
        bg-neutral-900 border rounded-lg
        transition-all duration-150 w-[248px]
        ${isEmpty ? 'opacity-40' : 'opacity-100'}
        ${selected
          ? 'border-emerald-500/70 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-500/10'
          : 'border-neutral-800 hover:border-neutral-700'}
      `}>

        {/* Complexity-tinted icon */}
        <div className={`p-1 rounded-md flex-shrink-0 ${cx ? cx.bg : 'bg-neutral-800'}`}>
          <Code2 size={12} className={cx ? cx.icon : 'text-neutral-500'} />
        </div>

        {/* Name / inline rename */}
        {isEditingLabel ? (
          <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            <input
              type="text" value={labelValue}
              onChange={e => setLabelValue(e.target.value)}
              onKeyDown={onKeyDown} autoFocus
              className="flex-1 min-w-0 bg-neutral-800 text-white text-xs font-mono
                         px-2 py-0.5 rounded border border-emerald-500 focus:outline-none"
            />
            <button onClick={e => { e.stopPropagation(); saveLabel();   }} className="text-emerald-400 hover:text-emerald-300 flex-shrink-0"><Check size={11} /></button>
            <button onClick={e => { e.stopPropagation(); cancelLabel(); }} className="text-neutral-600 hover:text-red-400   flex-shrink-0"><X     size={11} /></button>
          </div>
        ) : (
          <>
            <span
              className="flex-1 min-w-0 text-xs font-mono text-neutral-300 truncate
                         cursor-pointer hover:text-emerald-300 transition-colors"
              onDoubleClick={e => { e.stopPropagation(); setIsEditingLabel(true); setLabelValue(data.label); }}
              title="Double-click to rename · click to open details"
            >
              {data.label}
            </span>

            {/* Indicator dots — description + complexity */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {data.description?.trim() && (
                <div className="w-1 h-1 rounded-full bg-neutral-600" title="Has description" />
              )}
              {cx && (
                <div className={`w-1.5 h-1.5 rounded-full ${cx.dot}`} title={`${data.complexity} complexity`} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Handles */}
      {[
        ['source', Position.Left,   'left'],
        ['target', Position.Left,   'left-target'],
        ['source', Position.Right,  'right'],
        ['target', Position.Right,  'right-target'],
        ['source', Position.Top,    'top'],
        ['target', Position.Top,    'top-target'],
        ['source', Position.Bottom, 'bottom'],
        ['target', Position.Bottom, 'bottom-target'],
      ].map(([type, position, hid]) => (
        <Handle key={hid} type={type} position={position} id={hid}
          className="!w-2 !h-2 !bg-emerald-500/60 !border !border-neutral-900 !rounded-full"
          isConnectable={true} />
      ))}
    </div>
  );
}