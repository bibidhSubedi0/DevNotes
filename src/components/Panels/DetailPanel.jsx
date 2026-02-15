import React, { useState, useEffect, useRef } from 'react';
import {
  X, Code2, FileType2, Cpu, FolderGit2,
  Tag, ArrowRight, Layers, ChevronRight,
  AlertCircle, Plus, Trash2, Edit3, Check, RefreshCw
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

const TextareaField = ({ value, onChange, placeholder, rows = 3, autoFocus = false }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    autoFocus={autoFocus}
    className="w-full bg-neutral-800/80 text-neutral-200 text-sm px-3 py-2.5 rounded-xl
               border border-neutral-700 focus:border-neutral-500 focus:outline-none
               resize-none leading-relaxed placeholder:text-neutral-600
               transition-colors"
  />
);

const InputField = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
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
    const t = inputVal.trim();
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
        onBlur={addTag}
        placeholder={tags.length ? '' : placeholder}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-neutral-300
                   outline-none placeholder:text-neutral-600"
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

/* ─── SECTION PANELS per type ───────────────────────────────────────────── */

function FunctionDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Description">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="What does this function do? What problem does it solve?"
          rows={4}
        />
      </Field>

      <Field label="Parameters">
        <TagEditor
          tags={draft.params || []}
          onChange={v => setDraft(d => ({ ...d, params: v }))}
          placeholder="Add param (e.g.  userId: string)"
        />
        <p className="text-[11px] text-neutral-600 mt-1.5">Enter + comma to add each param</p>
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

      <Field label="Notes / Side-effects">
        <TextareaField
          value={draft.notes || ''}
          onChange={v => setDraft(d => ({ ...d, notes: v }))}
          placeholder="Edge cases, gotchas, side-effects…"
          rows={2}
        />
      </Field>
    </>
  );
}

function FileDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Purpose">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="What is this file responsible for?"
          rows={3}
        />
      </Field>

      <Field label="File Type">
        <FileTypePicker
          value={draft.fileType || 'typescript'}
          onChange={v => setDraft(d => ({ ...d, fileType: v }))}
        />
      </Field>

      <Field label="Key Exports">
        <TagEditor
          tags={draft.exports || []}
          onChange={v => setDraft(d => ({ ...d, exports: v }))}
          placeholder="AuthService, loginHandler…"
        />
        <p className="text-[11px] text-neutral-600 mt-1.5">List what this file exports</p>
      </Field>

      <Field label="Dependencies / Imports">
        <TagEditor
          tags={draft.dependencies || []}
          onChange={v => setDraft(d => ({ ...d, dependencies: v }))}
          placeholder="axios, react-query, zod…"
        />
      </Field>

      <Field label="Notes">
        <TextareaField
          value={draft.notes || ''}
          onChange={v => setDraft(d => ({ ...d, notes: v }))}
          placeholder="Anything important about this file…"
          rows={2}
        />
      </Field>
    </>
  );
}

function ComponentDetails({ draft, setDraft }) {
  return (
    <>
      <Field label="Purpose">
        <TextareaField
          value={draft.description || ''}
          onChange={v => setDraft(d => ({ ...d, description: v }))}
          placeholder="What is this component responsible for? What domain does it own?"
          rows={4}
        />
      </Field>

      <Field label="Tech Stack / Libraries">
        <TagEditor
          tags={draft.techStack || []}
          onChange={v => setDraft(d => ({ ...d, techStack: v }))}
          placeholder="React Query, Zod, Axios…"
        />
      </Field>

      <Field label="Props / Interface">
        <TagEditor
          tags={draft.props || []}
          onChange={v => setDraft(d => ({ ...d, props: v }))}
          placeholder="userId, onSuccess, config…"
        />
      </Field>

      <Field label="Status">
        <div className="flex gap-2">
          {['planned', 'in-progress', 'stable', 'deprecated'].map(s => (
            <button key={s} onClick={() => setDraft(d => ({ ...d, status: s }))}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all
                ${draft.status === s
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600'
                }`}>
              {s}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Notes">
        <TextareaField
          value={draft.notes || ''}
          onChange={v => setDraft(d => ({ ...d, notes: v }))}
          placeholder="Architecture decisions, known issues…"
          rows={2}
        />
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
          placeholder="What is this project? What problem does it solve?"
          rows={4}
        />
      </Field>

      <Field label="Tech Stack">
        <TagEditor
          tags={draft.techStack || []}
          onChange={v => setDraft(d => ({ ...d, techStack: v }))}
          placeholder="React, Node, PostgreSQL…"
        />
      </Field>

      <Field label="Repo / Links">
        <TagEditor
          tags={draft.links || []}
          onChange={v => setDraft(d => ({ ...d, links: v }))}
          placeholder="github.com/org/repo"
        />
      </Field>

      <Field label="Stage">
        <div className="flex gap-2 flex-wrap">
          {['idea', 'prototyping', 'development', 'production', 'archived'].map(s => (
            <button key={s} onClick={() => setDraft(d => ({ ...d, stage: s }))}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all
                ${draft.stage === s
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-600'
                }`}>
              {s}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Notes">
        <TextareaField
          value={draft.notes || ''}
          onChange={v => setDraft(d => ({ ...d, notes: v }))}
          placeholder="Context, decisions, things to remember…"
          rows={2}
        />
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

/* ─── MAIN PANEL ────────────────────────────────────────────────────────── */

export const DetailPanel = ({ selectedNodeId, nodes, setNodes, onClose }) => {
  const node = nodes.find(n => n.id === selectedNodeId);
  const [draft, setDraft] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [editingLabel, setEditingLabel] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef(null);

  // Re-initialise draft when selected node changes
  useEffect(() => {
    if (node) {
      setDraft({ ...node.data });
      setLabelDraft(node.data.label || '');
      setEditingLabel(false);
      setSaved(false);
    }
  }, [selectedNodeId]);

  if (!node || !draft) return null;

  const config = NODE_CONFIG[node.type] || NODE_CONFIG.function;
  const Icon = config.icon;
  const SectionContent = SECTION_MAP[node.type];

  // Save label
  const saveLabel = () => {
    const trimmed = labelDraft.trim();
    if (trimmed) {
      setDraft(d => ({ ...d, label: trimmed }));
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

  return (
    <div
      className="fixed right-0 top-0 h-screen w-[360px] z-40
                 bg-neutral-950/98 backdrop-blur-xl border-l border-neutral-800
                 flex flex-col shadow-2xl"
      style={{ animation: 'slideInFromRight 0.22s cubic-bezier(0.22,1,0.36,1)' }}
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
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-300
                     hover:bg-neutral-800 transition-all"
        >
          <X size={16} />
        </button>
      </div>

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
              <Edit3 size={13} />
            </button>
          </div>
        )}
        {/* parent breadcrumb */}
        {node.parentId && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11px] text-neutral-600">inside</span>
            <span className="text-[11px] text-neutral-500 font-medium">
              {nodes.find(n => n.id === node.parentId)?.data?.label ?? node.parentId}
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
        {SectionContent && <SectionContent draft={draft} setDraft={setDraft} />}
      </div>

      {/* ── Save / Discard footer ── */}
      <div className="px-5 py-4 border-t border-neutral-800/80 bg-neutral-950">
        {isDirty ? (
          <div className="flex gap-2">
            <button
              onClick={commitSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold
                         transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check size={15} /> Save Changes
            </button>
            <button
              onClick={discard}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700
                         text-neutral-400 hover:text-neutral-200 text-sm transition-all border border-neutral-700"
              title="Discard changes"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        ) : saved ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                          bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <Check size={15} /> Saved
          </div>
        ) : (
          <div className="text-center text-[11px] text-neutral-700">
            Edit any field above to make changes
          </div>
        )}
      </div>
    </div>
  );
};