import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Search, FolderGit2, Box, FileCode, Code2, X, CornerDownLeft } from 'lucide-react';

const TYPE_CONFIG = {
  project:   { icon: FolderGit2, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Project'   },
  component: { icon: Box,        color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   label: 'Component' },
  file:      { icon: FileCode,   color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'File'      },
  function:  { icon: Code2,      color: 'text-emerald-400',bg: 'bg-emerald-500/10',label: 'Function'  },
};

// Simple fuzzy match — returns score (higher = better), 0 = no match
const fuzzyScore = (str, query) => {
  if (!str || !query) return 0;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  if (s.includes(q)) return q.length / s.length + 1; // exact substring scores higher
  let si = 0, qi = 0, score = 0;
  while (si < s.length && qi < q.length) {
    if (s[si] === q[qi]) { score++; qi++; }
    si++;
  }
  return qi === q.length ? score / s.length : 0;
};

const buildResults = (nodes, query) => {
  if (!query.trim()) return [];

  // Build parent lookup for breadcrumbs
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const getBreadcrumb = (node) => {
    const parts = [];
    let current = node;
    while (current.parentId) {
      const parent = nodeMap.get(current.parentId);
      if (!parent) break;
      parts.unshift(parent.data?.label ?? parent.id);
      current = parent;
    }
    return parts;
  };

  return nodes
    .filter(n => TYPE_CONFIG[n.type]) // only known types
    .map(node => {
      const label = node.data?.label ?? '';
      const desc  = node.data?.description ?? '';
      const tags  = (node.data?.tags ?? []).join(' ');
      const score = Math.max(
        fuzzyScore(label, query) * 3,  // label matches weighted highest
        fuzzyScore(desc, query) * 1.5,
        fuzzyScore(tags, query),
      );
      return { node, score, breadcrumb: getBreadcrumb(node) };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12); // cap results
};

export const SearchPanel = ({ nodes, isOpen, onClose }) => {
  const { fitView, setCenter, getNode } = useReactFlow();
  const [query, setQuery]     = useState('');
  const [cursor, setCursor]   = useState(0);
  const inputRef              = useRef(null);
  const listRef               = useRef(null);

  const results = useMemo(() => buildResults(nodes, query), [nodes, query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Clamp cursor when results change
  useEffect(() => {
    setCursor(c => Math.min(c, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Zoom to a node
  const goToNode = useCallback((node) => {
    onClose();
    setTimeout(() => {
      fitView({
        nodes: [{ id: node.id }],
        duration: 400,
        padding: 0.3,
        maxZoom: 1.2,
      });
    }, 50);
  }, [fitView, onClose]);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    }
    if (e.key === 'Enter' && results[cursor]) {
      goToNode(results[cursor].node);
    }
  };

  // Scroll active result into view
  useEffect(() => {
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [cursor]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50
                      w-full max-w-lg
                      bg-neutral-900 border border-neutral-700/80
                      rounded-2xl shadow-2xl shadow-black/60
                      overflow-hidden
                      animate-in fade-in slide-in-from-top-4 duration-150">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800">
          <Search size={16} className="text-neutral-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search nodes, files, functions…"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600
                       focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-600 hover:text-neutral-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        {query.trim() && (
          <div ref={listRef} className="max-h-80 overflow-y-auto py-1.5">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-600">
                No nodes match "{query}"
              </div>
            ) : (
              results.map(({ node, breadcrumb }, i) => {
                const cfg  = TYPE_CONFIG[node.type];
                const Icon = cfg.icon;
                const active = i === cursor;
                return (
                  <button
                    key={node.id}
                    onClick={() => goToNode(node)}
                    onMouseEnter={() => setCursor(i)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left
                      transition-colors duration-75
                      ${active ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'}
                    `}
                  >
                    {/* Type icon */}
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={13} className={cfg.color} />
                    </div>

                    {/* Label + breadcrumb */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-200 truncate">
                        {node.data?.label ?? node.id}
                      </div>
                      {breadcrumb.length > 0 && (
                        <div className="text-[11px] text-neutral-600 truncate">
                          {breadcrumb.join(' › ')}
                        </div>
                      )}
                    </div>

                    {/* Type badge */}
                    <span className={`text-[10px] font-semibold flex-shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>

                    {/* Enter hint on active */}
                    {active && (
                      <CornerDownLeft size={12} className="text-neutral-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Empty state / hint */}
        {!query.trim() && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-neutral-600">
              Type to search across all nodes
            </p>
            <p className="text-xs text-neutral-700 mt-1">
              Searches labels, descriptions, and tags
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-neutral-800/60 bg-neutral-950/40">
          <span className="text-[11px] text-neutral-700 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-500">↑↓</kbd>
            navigate
          </span>
          <span className="text-[11px] text-neutral-700 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-500">↵</kbd>
            jump to
          </span>
          <span className="text-[11px] text-neutral-700 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-500">Esc</kbd>
            close
          </span>
          {results.length > 0 && (
            <span className="ml-auto text-[11px] text-neutral-700">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </>
  );
};