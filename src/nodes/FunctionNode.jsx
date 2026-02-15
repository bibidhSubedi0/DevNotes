import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Code2, ChevronDown, ChevronUp, Check, X, Edit3 } from 'lucide-react';

export default function FunctionNode({ id, data, selected }) {
  const [isExpanded, setIsExpanded]       = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDesc, setIsEditingDesc]   = useState(false);
  const [labelValue, setLabelValue]         = useState(data.label);
  const [descValue, setDescValue]           = useState(data.description || '');
  const { setNodes } = useReactFlow();

  /* ── label ── */
  const saveLabelEdit = () => {
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

  const cancelLabelEdit = () => {
    setLabelValue(data.label);
    setIsEditingLabel(false);
  };

  const onLabelKey = (e) => {
    if (e.key === 'Enter')  saveLabelEdit();
    if (e.key === 'Escape') cancelLabelEdit();
  };

  /* ── description ── */
  const saveDescEdit = () => {
    setNodes(nodes =>
      nodes.map(n => n.id === id ? { ...n, data: { ...n.data, description: descValue } } : n)
    );
    setIsEditingDesc(false);
  };

  const cancelDescEdit = () => {
    setDescValue(data.description || '');
    setIsEditingDesc(false);
  };

  const onDescKey = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) saveDescEdit();
    if (e.key === 'Escape')             cancelDescEdit();
  };

  const hasDesc = Boolean(data.description?.trim());

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="relative">

      {/* ── Main pill ── */}
      <div className={`
        flex items-center gap-2 pl-3 pr-2 py-2
        bg-neutral-900 border-2 rounded-xl
        shadow-lg transition-all duration-150
        min-w-[200px]
        ${selected
          ? 'border-emerald-400 shadow-emerald-500/20'
          : 'border-neutral-700 hover:border-emerald-600/50'}
      `}>

        {/* icon */}
        <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors
          ${isExpanded ? 'bg-emerald-500/20' : 'bg-neutral-800'}`}>
          <Code2 size={13} className={`transition-colors
            ${isExpanded ? 'text-emerald-400' : 'text-neutral-500'}`} />
        </div>

        {/* label or inline rename */}
        {isEditingLabel ? (
          <div className="flex items-center gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={labelValue}
              onChange={e => setLabelValue(e.target.value)}
              onKeyDown={onLabelKey}
              autoFocus
              className="bg-neutral-800 text-white text-sm font-mono px-2 py-0.5 rounded-lg
                         border-2 border-emerald-500 focus:outline-none flex-1 min-w-0"
            />
            <button onClick={saveLabelEdit}
              className="p-1 rounded text-emerald-400 hover:bg-emerald-500/15 transition-colors flex-shrink-0">
              <Check size={12} />
            </button>
            <button onClick={cancelLabelEdit}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-800 hover:text-red-400
                         transition-colors flex-shrink-0">
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <span
              className="text-sm font-mono text-neutral-100 truncate flex-1 cursor-pointer
                         hover:text-emerald-300 transition-colors"
              onDoubleClick={e => {
                e.stopPropagation();
                setIsEditingLabel(true);
                setLabelValue(data.label);
              }}
              title="Double-click to rename"
            >
              {data.label}
            </span>

            {/* green dot when there's a description but panel is closed */}
            {hasDesc && !isExpanded && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 flex-shrink-0"
                   title="Has description" />
            )}

            {/* expand / collapse toggle */}
            <button
              onClick={e => { e.stopPropagation(); setIsExpanded(v => !v); }}
              className={`p-1.5 rounded-lg transition-all flex-shrink-0
                ${isExpanded
                  ? 'text-emerald-400 bg-emerald-500/15'
                  : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800'}`}
              title={isExpanded ? 'Collapse' : 'Expand description'}
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </>
        )}
      </div>

      {/* ── Inline description panel ── */}
      {isExpanded && (
        <div className="mt-1.5 bg-neutral-900 border-2 border-neutral-700 rounded-xl
                        overflow-hidden shadow-xl min-w-[240px] animate-slideUp">

          {/* panel header */}
          <div className="flex items-center justify-between px-3 py-2
                          bg-neutral-800/80 border-b border-neutral-700/60">
            <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest">
              Description
            </span>
            {!isEditingDesc && (
              <button
                onClick={() => { setIsEditingDesc(true); setDescValue(data.description || ''); }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium
                           text-neutral-500 hover:text-emerald-400 hover:bg-neutral-700 transition-all"
              >
                <Edit3 size={10} />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* panel body */}
          <div className="px-3 py-2.5">
            {isEditingDesc ? (
              <>
                <textarea
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  onKeyDown={onDescKey}
                  autoFocus
                  rows={3}
                  placeholder="Describe what this function does…"
                  className="w-full bg-neutral-800 text-neutral-100 text-xs px-2.5 py-2 rounded-lg
                             border border-neutral-600 focus:border-emerald-500 focus:outline-none
                             resize-none leading-relaxed placeholder:text-neutral-600"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={saveDescEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500
                               text-white text-xs font-semibold rounded-lg transition-colors">
                    <Check size={11} /> Save
                  </button>
                  <button onClick={cancelDescEdit}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300
                               text-xs font-medium rounded-lg transition-colors border border-neutral-700">
                    Cancel
                  </button>
                  <span className="text-[10px] text-neutral-600 ml-auto">Ctrl + Enter</span>
                </div>
              </>
            ) : (
              <p
                className={`text-xs leading-relaxed cursor-pointer transition-colors
                  ${hasDesc
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-neutral-600 italic hover:text-neutral-500'}`}
                onDoubleClick={() => {
                  setIsEditingDesc(true);
                  setDescValue(data.description || '');
                }}
                title="Double-click to edit"
              >
                {data.description || 'No description yet — double-click to add one.'}
              </p>
            )}
          </div>
        </div>
      )}

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
          className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-neutral-900
                     !rounded-full !shadow-sm !shadow-emerald-500/30"
          isConnectable={true}
        />
      ))}
    </div>
  );
}