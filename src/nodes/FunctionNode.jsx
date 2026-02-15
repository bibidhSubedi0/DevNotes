import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Code2, Check, X } from 'lucide-react';

/* ── complexity config ─────────────────────────────────────────────────── */
const COMPLEXITY = {
  low:    { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'low' },
  medium: { dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'med' },
  high:   { dot: 'bg-red-400',     text: 'text-red-400',     label: 'high' },
};

export default function FunctionNode({ id, data, selected }) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue]         = useState(data.label);
  const { setNodes } = useReactFlow();

  /* ── label save / cancel ── */
  const saveLabel = () => {
    const trimmed = labelValue.trim();
    if (trimmed) {
      setNodes(nodes =>
        nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n)
      );
    } else {
      setLabelValue(data.label);
    }
    setIsEditingLabel(false);
  };

  const cancelLabel = () => {
    setLabelValue(data.label);
    setIsEditingLabel(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter')  { e.stopPropagation(); saveLabel(); }
    if (e.key === 'Escape') { e.stopPropagation(); cancelLabel(); }
  };

  /* ── derived display data ── */
  const complexity    = COMPLEXITY[data.complexity] ?? null;
  const tags          = Array.isArray(data.tags) ? data.tags.slice(0, 3) : [];
  const params        = Array.isArray(data.params) ? data.params : [];
  const hasDesc       = Boolean(data.description?.trim());
  const hasReturnType = Boolean(data.returns?.trim());
  const hasExtra      = complexity || tags.length > 0 || hasReturnType;

  return (
    <div className="relative">

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div
        className={`
          bg-neutral-900 border-2 rounded-xl shadow-lg
          transition-all duration-150 w-[260px]
          ${selected
            ? 'border-emerald-400 shadow-emerald-500/25 ring-4 ring-emerald-500/10'
            : 'border-neutral-800 hover:border-emerald-700/60 hover:shadow-emerald-500/10'}
        `}
      >

        {/* ── Header row ── */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
          {/* icon — doubles as complexity indicator */}
          <div className={`
            p-1.5 rounded-lg flex-shrink-0 relative
            ${complexity ? '' : 'bg-neutral-800'}
            ${data.complexity === 'low'    ? 'bg-emerald-500/10' : ''}
            ${data.complexity === 'medium' ? 'bg-amber-500/10'   : ''}
            ${data.complexity === 'high'   ? 'bg-red-500/10'     : ''}
          `}>
            <Code2 size={13} className={`
              ${data.complexity === 'low'    ? 'text-emerald-400' : ''}
              ${data.complexity === 'medium' ? 'text-amber-400'   : ''}
              ${data.complexity === 'high'   ? 'text-red-400'     : ''}
              ${!data.complexity             ? 'text-neutral-500' : ''}
            `} />
          </div>

          {/* Function name — inline rename on double-click */}
          <div className="flex-1 min-w-0">
            {isEditingLabel ? (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={labelValue}
                  onChange={e => setLabelValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  className="flex-1 min-w-0 bg-neutral-800 text-white text-sm font-mono
                             px-2 py-0.5 rounded-lg border-2 border-emerald-500
                             focus:outline-none"
                />
                <button
                  onClick={e => { e.stopPropagation(); saveLabel(); }}
                  className="p-1 rounded text-emerald-400 hover:bg-emerald-500/15 flex-shrink-0"
                >
                  <Check size={11} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); cancelLabel(); }}
                  className="p-1 rounded text-neutral-500 hover:text-red-400 flex-shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <span
                className="text-sm font-mono font-semibold text-neutral-100 block truncate
                           cursor-pointer hover:text-emerald-300 transition-colors"
                onDoubleClick={e => {
                  e.stopPropagation();
                  setIsEditingLabel(true);
                  setLabelValue(data.label);
                }}
                title="Double-click to rename"
              >
                {data.label}
              </span>
            )}
          </div>

          {/* Complexity badge — top right */}
          {complexity && !isEditingLabel && (
            <span className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${complexity.text}`}>
              {complexity.label}
            </span>
          )}
        </div>

        {/* ── Description — always visible if it exists ── */}
        {hasDesc && (
          <div className="px-3 pb-2.5">
            <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
              {data.description}
            </p>
          </div>
        )}

        {/* ── Footer row — params, return type, tags ── */}
        {hasExtra && (
          <div className="px-3 pb-3 pt-0.5 border-t border-neutral-800/80 mt-1 flex flex-wrap items-center gap-1.5">

            {/* return type */}
            {hasReturnType && (
              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                <span className="text-neutral-700">→</span>
                <span className="text-neutral-400">{data.returns}</span>
              </span>
            )}

            {/* spacer */}
            {hasReturnType && tags.length > 0 && (
              <span className="text-neutral-800 text-[10px]">·</span>
            )}

            {/* tags */}
            {tags.map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700
                           text-[10px] text-neutral-500 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}

            {/* overflow tag count */}
            {Array.isArray(data.tags) && data.tags.length > 3 && (
              <span className="text-[10px] text-neutral-600">
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ── Click hint — only shown when nothing else is ── */}
        {!hasDesc && !hasExtra && (
          <div className="px-3 pb-3">
            <span className="text-[10px] text-neutral-700 italic">
              Click to add details
            </span>
          </div>
        )}
      </div>

      {/* ── Handles ── */}
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
        <Handle
          key={hid}
          type={type}
          position={position}
          id={hid}
          className="!w-2.5 !h-2.5 !bg-emerald-500/70 !border-2 !border-neutral-900
                     !rounded-full !shadow-sm"
          isConnectable={true}
        />
      ))}
    </div>
  );
}