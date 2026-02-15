import { Trash2, ChevronRight, ChevronDown, Copy, X, Zap } from 'lucide-react';

const COMPLEXITY_OPTIONS = [
  { value: 'low',    label: 'Low',    color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-700/50' },
  { value: 'medium', label: 'Med',    color: 'bg-amber-500/20   text-amber-400   hover:bg-amber-500/30   border-amber-700/50'   },
  { value: 'high',   label: 'High',   color: 'bg-red-500/20     text-red-400     hover:bg-red-500/30     border-red-700/50'     },
];

export const BulkActionsBar = ({ selectedNodes, nodes, setNodes, setEdges, onClear }) => {
  if (selectedNodes.length < 2) return null;

  const types     = new Set(selectedNodes.map(n => n.type));
  const hasFiles  = types.has('file');
  const hasFns    = types.has('function');
  const hasComps  = types.has('component');
  const count     = selectedNodes.length;
  const selectedIds = new Set(selectedNodes.map(n => n.id));

  // ── Collect all descendant IDs recursively ──
  const getAllDescendants = (ids, allNodes) => {
    const result = new Set();
    const queue  = [...ids];
    while (queue.length) {
      const id = queue.shift();
      allNodes.forEach(n => {
        if (n.parentId === id && !result.has(n.id)) {
          result.add(n.id);
          queue.push(n.id);
        }
      });
    }
    return result;
  };

  // ── Delete ──
  const handleDelete = () => {
    const descendants = getAllDescendants([...selectedIds], nodes);
    const toRemove    = new Set([...selectedIds, ...descendants]);
    setNodes(nds => nds.filter(n => !toRemove.has(n.id)));
    setEdges(eds => eds.filter(e => !toRemove.has(e.source) && !toRemove.has(e.target)));
    onClear();
  };

  // ── Collapse / Expand files ──
  const setFileCollapse = (collapsed) => {
    setNodes(nds => nds.map(n => {
      if (!selectedIds.has(n.id) || n.type !== 'file') return n;
      return { ...n, data: { ...n.data, collapsed } };
    }));
  };

  // ── Set complexity on functions ──
  const setComplexity = (complexity) => {
    setNodes(nds => nds.map(n => {
      if (!selectedIds.has(n.id) || n.type !== 'function') return n;
      return { ...n, data: { ...n.data, complexity } };
    }));
  };

  // ── Duplicate components (deep clone with new IDs) ──
  const handleDuplicate = () => {
    const comps = selectedNodes.filter(n => n.type === 'component');
    if (!comps.length) return;

    const newNodes = [];
    comps.forEach(comp => {
      const idMap    = {};
      const newCompId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      idMap[comp.id]  = newCompId;

      // Clone component
      newNodes.push({
        ...comp,
        id:       newCompId,
        selected: false,
        position: { x: comp.position.x + 40, y: comp.position.y + 40 },
        data:     { ...comp.data, label: comp.data.label + ' (copy)' },
      });

      // Clone children recursively
      const cloneChildren = (parentId, newParentId) => {
        nodes
          .filter(n => n.parentId === parentId)
          .forEach(child => {
            const newChildId = `${child.type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            idMap[child.id]  = newChildId;
            newNodes.push({
              ...child,
              id:       newChildId,
              parentId: newParentId,
              selected: false,
              data:     { ...child.data },
            });
            cloneChildren(child.id, newChildId);
          });
      };

      cloneChildren(comp.id, newCompId);
    });

    setNodes(nds => [...nds, ...newNodes]);
    onClear();
  };

  const Divider = () => (
    <div className="w-px h-5 bg-neutral-700/80 flex-shrink-0" />
  );

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto
                      flex items-center gap-1.5 px-3 py-2
                      bg-neutral-900/97 backdrop-blur-xl
                      border border-neutral-700/70 rounded-2xl
                      shadow-2xl shadow-black/50
                      animate-in slide-in-from-bottom-2 duration-200">

        {/* Selection count badge */}
        <div className="flex items-center gap-1.5 pr-1">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-cyan-400">{count}</span>
          </div>
          <span className="text-xs text-neutral-500 select-none">selected</span>
        </div>

        <Divider />

        {/* File actions */}
        {hasFiles && (
          <>
            <button
              onClick={() => setFileCollapse(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              title="Collapse selected files"
            >
              <ChevronRight size={13} />
              Collapse
            </button>
            <button
              onClick={() => setFileCollapse(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              title="Expand selected files"
            >
              <ChevronDown size={13} />
              Expand
            </button>
            <Divider />
          </>
        )}

        {/* Function complexity */}
        {hasFns && (
          <>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-neutral-600" />
              {COMPLEXITY_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setComplexity(value)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-all ${color}`}
                  title={`Set complexity to ${value}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Divider />
          </>
        )}

        {/* Duplicate — components only */}
        {hasComps && (
          <>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              title="Duplicate selected components"
            >
              <Copy size={13} />
              Duplicate
            </button>
            <Divider />
          </>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                     text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete selected nodes and all their children"
        >
          <Trash2 size={13} />
          Delete
        </button>

        <Divider />

        {/* Dismiss */}
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-400
                     hover:bg-neutral-800 transition-all"
          title="Deselect all"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};