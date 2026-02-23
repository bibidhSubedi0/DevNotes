import React, { useState, useEffect, useRef } from 'react';
import { sanitizeLabel, sanitizeDescription, sanitizeTags } from '../../utils/sanitize';
import {
  X, Code2, FileType2, Cpu, FolderGit2,
  Tag, ArrowRight, Layers, ChevronRight, ChevronLeft,
  AlertCircle, Plus, Trash2, Edit3, Check, RefreshCw, Pin, PinOff
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────────────────── */

const Badge = ({ children, color = 'neutral' }) => {
  const colors = {
    purple:  'bg-purple-500/15 text-purple-300 border-purple-500/30',
    cyan:    'bg-cyan-500/15    text-cyan-300    border-cyan-500/30',
    blue:    'bg-blue-500/15    text-blue-300    border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    neutral: 'bg-neutral-700   text-neutral-300  border-neutral-600',
    amber:   'bg-amber-500/15  text-amber-300   border-amber-500/30',
    red:     'bg-red-500/15    text-red-300     border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px]
                      font-semibold border tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
};

const SectionLabel = ({ children }) => (
  <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-2">
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="mb-4">
    <SectionLabel>{label}</SectionLabel>
    {children}
  </div>
);

// ── AUTO-GROWING TEXTAREA (expands to fit content, no internal scroll) ──
const TextareaField = ({ value, onChange, placeholder, rows = 10, autoFocus = false }) => {
  const textareaRef = useRef(null);
  
  // Auto-resize on content change
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    
    // Reset height to recalculate
    el.style.height = 'auto';
    // Set to scrollHeight (content height)
    el.style.height = Math.max(el.scrollHeight, rows * 20) + 'px';
  }, [value, rows]);
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => onChange(sanitizeDescription(e.target.value))}
      placeholder={placeholder}
      rows={rows}
      autoFocus={autoFocus}
      className="w-full bg-neutral-800/80 text-neutral-200 text-sm px-3 py-2.5 rounded-xl
                 border border-neutral-700 focus:border-neutral-500 focus:outline-none
                 resize-none leading-relaxed placeholder:text-neutral-600
                 transition-colors overflow-hidden"
      style={{ minHeight: `${rows * 20}px` }}
    />
  );
};

const InputField = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(sanitizeLabel(e.target.value))}
    placeholder={placeholder}
    className="w-full bg-neutral-800/80 text-neutral-200 text-sm px-3 py-2 rounded-xl
               border border-neutral-700 focus:border-neutral-500 focus:outline-none
               placeholder:text-neutral-600 transition-colors"
  />
);

/* ─── Tag list editor ───────────────────────────────────────────────────── */
const TagEditor = ({ tags = [], onChange, placeholder, color = 'neutral' }) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = () => {
    const t = sanitizeLabel(inputVal.trim());
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInputVal('');
  };

  const removeTag = (t) => onChange(tags.filter(x => x !== t));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !inputVal && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div className="bg-neutral-800/80 rounded-xl border border-neutral-700 px-3 py-2.5 flex flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium
                      bg-neutral-700 text-neutral-200 border border-neutral-600`}>
          {t}
          <button onClick={() => removeTag(t)}
            className="text-neutral-500 hover:text-red-400 transition-colors ml-0.5">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={onKey}
        placeholder={!tags.length ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-neutral-200
                   placeholder:text-neutral-600 focus:outline-none"
      />
    </div>
  );
};

/* ─── Complexity selector ───────────────────────────────────────────────── */
const COMPLEXITY_OPTIONS = [
  { value: 'low',     label: 'Low',     color: 'emerald' },
  { value: 'medium',  label: 'Medium',  color: 'amber'   },
  { value: 'high',    label: 'High',    color: 'red'      },
];
const ComplexityPicker = ({ value, onChange }) => (
  <div className="flex gap-2">
    {COMPLEXITY_OPTIONS.map(opt => (
      <button key={opt.value} onClick={() => onChange(opt.value)}
        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all
          ${value === opt.value
            ? opt.value === 'low'    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : opt.value === 'medium' ? 'bg-amber-500/20   border-amber-500/50   text-amber-300'
            :                          'bg-red-500/20     border-red-500/50     text-red-300'
            : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
          }`}>
        {opt.label}
      </button>
    ))}
  </div>
);

/* ─── FILE TYPE selector ────────────────────────────────────────────────── */
const FILE_TYPES = ['typescript', 'javascript', 'react', 'python', 'css', 'json', 'other'];
const FileTypePicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {FILE_TYPES.map(ft => (
      <button key={ft} onClick={() => onChange(ft)}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all
          ${value === ft
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
            : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
          }`}>
        {ft}
      </button>
    ))}
  </div>
);

/* ─── NODE TYPE CONFIG ──────────────────────────────────────────────────── */
const NODE_CONFIG = {
  function:  { icon: Code2,       color: 'emerald', label: 'Function',  accent: '#10b981' },
  file:      { icon: FileType2,   color: 'blue',    label: 'File',      accent: '#3b82f6' },
  component: { icon: Cpu,         color: 'cyan',    label: 'Component', accent: '#06b6d4' },
  project:   { icon: FolderGit2,  color: 'purple',  label: 'Project',   accent: '#a855f7' },
};

/* ─── BREADCRUMB (shows hierarchy: Project > Component > File > Function) ── */
const Breadcrumb = ({ node, nodes }) => {
  const crumbs = [];
  let current = node;
  
  while (current) {
    const config = NODE_CONFIG[current.type];
    crumbs.unshift({
      id: current.id,
      label: current.data?.label || current.id,
      icon: config?.icon || Code2,
    });
    current = current.parentId ? nodes.find(n => n.id === current.parentId) : null;
  }

  if (crumbs.length <= 1) return null;

  return (
    <div className="px-5 py-2 border-b border-neutral-800/50 bg-neutral-900/50">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto">
        {crumbs.map((crumb, i) => {
          const Icon = crumb.icon;
          return (
            <React.Fragment key={crumb.id}>
              {i > 0 && <ChevronRight size={12} className="flex-shrink-0" />}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Icon size={11} />
                <span className={i === crumbs.length - 1 ? 'text-neutral-300 font-medium' : ''}>
                  {crumb.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ─── SECTION PANELS per type ───────────────────────────────────────────── */

function FunctionDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Description">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="What does this function do? What problem does it solve? Include edge cases, side effects, and why it exists."
          rows={10}
        />
      </Field>

      <Field label="Parameters">
        <TagEditor
          tags={draft.params || []}
          onChange={v => setDraft(d => ({ ...d, params: v }))}
          placeholder="Add param (e.g.  userId: string)"
        />
        <p className="text-[11px] text-neutral-600 mt-1.5">Enter or comma to add</p>
      </Field>

      <Field label="Return Type">
        <InputField
          value={draft.returns || ''}
          onChange={v => setDraft(d => ({ ...d, returns: v }))}
          placeholder="e.g.  Promise<User>  or  void"
        />
      </Field>

      <Field label="Complexity">
        <ComplexityPicker
          value={draft.complexity || 'low'}
          onChange={v => setDraft(d => ({ ...d, complexity: v }))}
        />
      </Field>

      <Field label="Tags">
        <TagEditor
          tags={draft.tags || []}
          onChange={v => setDraft(d => ({ ...d, tags: v }))}
          placeholder="auth, async, critical…"
        />
      </Field>
    </>
  );
}

function FileDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Description">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="Purpose of this file. What responsibilities does it handle? What modules does it export?"
          rows={8}
        />
      </Field>

      <Field label="File Type">
        <FileTypePicker
          value={draft.fileType || 'typescript'}
          onChange={v => setDraft(d => ({ ...d, fileType: v }))}
        />
      </Field>

      <Field label="Exports">
        <TagEditor
          tags={draft.exports || []}
          onChange={v => setDraft(d => ({ ...d, exports: v }))}
          placeholder="Add exported symbols"
        />
      </Field>
    </>
  );
}

function ComponentDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Description">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="What does this component do? What are its responsibilities? How does it fit into the larger system?"
          rows={8}
        />
      </Field>

      <Field label="Tech Stack">
        <TagEditor
          tags={draft.techStack || []}
          onChange={v => setDraft(d => ({ ...d, techStack: v }))}
          placeholder="React, Redux, Axios…"
        />
      </Field>

      <Field label="Status">
        <div className="flex gap-2">
          {['planning', 'in-progress', 'stable', 'deprecated'].map(s => (
            <button key={s} onClick={() => setDraft(d => ({ ...d, status: s }))}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${draft.status === s
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600'
                }`}>
              {s}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function ProjectDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Description">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="High-level overview. What problem does this project solve? Who are the users? What's the architecture?"
          rows={12}
        />
      </Field>

      <Field label="Tech Stack">
        <TagEditor
          tags={draft.techStack || []}
          onChange={v => setDraft(d => ({ ...d, techStack: v }))}
          placeholder="React, Node.js, PostgreSQL…"
        />
      </Field>

      <Field label="Stage">
        <div className="flex gap-2">
          {['concept', 'development', 'production', 'maintenance'].map(s => (
            <button key={s} onClick={() => setDraft(d => ({ ...d, stage: s }))}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${draft.stage === s
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600'
                }`}>
              {s}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

const SECTION_MAP = {
  function:  FunctionDetails,
  file:      FileDetails,
  component: ComponentDetails,
  project:   ProjectDetails,
};

/* ─── MAIN DETAIL PANEL ─────────────────────────────────────────────────── */

export const DetailPanel = ({ selectedNodeId, nodes, setNodes, onClose }) => {
  const [draft, setDraft] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [editingLabel, setEditingLabel] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false); // lock-open mode
  const saveTimerRef = useRef(null);

  const node = nodes.find(n => n.id === selectedNodeId);

  useEffect(() => {
    if (node) {
      setDraft({ ...node.data });
      setLabelDraft(node.data.label || '');
      setEditingLabel(false);
      setSaved(false);
    }
  }, [selectedNodeId, node]);

  if (!node || !draft) return null;

  const config = NODE_CONFIG[node.type] || NODE_CONFIG.function;
  const Icon = config.icon;
  const SectionContent = SECTION_MAP[node.type];

  // ── NAVIGATION (prev/next) when locked ──────────────────────────────────
  const allNodes = nodes.filter(n => NODE_CONFIG[n.type]); // only documented types
  const currentIdx = allNodes.findIndex(n => n.id === selectedNodeId);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allNodes.length - 1;

  const goToPrev = () => {
    if (hasPrev) {
      commitSave();
      // Call onClose with the prev node ID so App can update selectedNodeId
      const prevNode = allNodes[currentIdx - 1];
      onClose(prevNode.id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      commitSave();
      const nextNode = allNodes[currentIdx + 1];
      onClose(nextNode.id);
    }
  };

  // Save label
  const saveLabel = () => {
    const sanitized = sanitizeLabel(labelDraft);
    if (sanitized) {
      setDraft(d => ({ ...d, label: sanitized }));
      setLabelDraft(sanitized);
    } else {
      setLabelDraft(draft.label);
    }
    setEditingLabel(false);
  };

  // Commit all changes to the node graph
  const commitSave = () => {
    setNodes(nds =>
      nds.map(n =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, ...draft } }
          : n
      )
    );
    setSaved(true);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  // Discard and revert to live node data
  const discard = () => {
    setDraft({ ...node.data });
    setLabelDraft(node.data.label || '');
    setEditingLabel(false);
    setSaved(false);
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(node.data);

  // Accent line color per type
  const accentStyle = { borderTop: `3px solid ${config.accent}` };

  // Handle close — if locked, don't actually close, just deselect visually
  const handleClose = () => {
    if (locked) return; // ignore close when locked
    onClose();
  };

  return (
    <div
      className="fixed right-0 top-12 w-[360px] z-40
                 bg-neutral-950/98 backdrop-blur-xl border-l border-neutral-800
                 flex flex-col shadow-2xl"
      style={{ 
        height: 'calc(100vh - 48px)',
        animation: 'slideInFromRight 0.22s cubic-bezier(0.22,1,0.36,1)' 
      }}
    >
      {/* ── accent line ── */}
      <div style={accentStyle} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${config.color}-500/15`}>
            <Icon size={16} className={`text-${config.color}-400`} />
          </div>
          <div>
            <Badge color={config.color}>{config.label}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Lock button */}
          <button
            onClick={() => setLocked(!locked)}
            className={`p-2 rounded-xl transition-all
              ${locked
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800'
              }`}
            title={locked ? 'Unlock panel' : 'Lock panel open (navigate with arrows)'}
          >
            {locked ? <Pin size={14} /> : <PinOff size={14} />}
          </button>

          {/* Prev/Next navigation when locked */}
          {locked && (
            <>
              <button
                onClick={goToPrev}
                disabled={!hasPrev}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800
                           transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous node"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToNext}
                disabled={!hasNext}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800
                           transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next node"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}

          {/* Close button (hidden when locked) */}
          {!locked && (
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-neutral-600 hover:text-neutral-300
                         hover:bg-neutral-800 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <Breadcrumb node={node} nodes={nodes} />

      {/* ── Node name / label ── */}
      <div className="px-5 py-4 border-b border-neutral-800/50">
        {editingLabel ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveLabel(); if (e.key === 'Escape') { setLabelDraft(draft.label); setEditingLabel(false); } }}
              autoFocus
              className="flex-1 bg-neutral-800 text-white text-lg font-bold px-3 py-1.5
                         rounded-xl border-2 border-neutral-500 focus:outline-none"
            />
            <button onClick={saveLabel} className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 group">
            <h2 className="text-lg font-bold text-white leading-snug font-mono break-all">
              {draft.label}
            </h2>
            <button
              onClick={() => { setEditingLabel(true); setLabelDraft(draft.label); }}
              className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-300
                         hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Rename"
            >
              <Edit3 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
        {SectionContent && <SectionContent draft={draft} setDraft={setDraft} />}
      </div>

      {/* ── Footer with Save/Discard ── */}
      <div className="border-t border-neutral-800 px-5 py-4 flex items-center gap-3 bg-neutral-900/80">
        {saved ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <Check size={14} />
            Saved
          </div>
        ) : isDirty ? (
          <>
            <button
              onClick={commitSave}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white
                         rounded-xl font-semibold text-sm transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={discard}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300
                         rounded-xl font-semibold text-sm transition-all"
            >
              Discard
            </button>
          </>
        ) : (
          <div className="text-neutral-600 text-sm">No changes</div>
        )}
      </div>
    </div>
  );
};